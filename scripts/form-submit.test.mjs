import test from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";

const { postLead, formOutcome, endpointIsSendable } = createRequire(import.meta.url)("../js/form-submit.js");

const payload = {
  form: "spec",
  offer: "free-spec-ad",
  language: "en",
  page: "/",
  email: "ada@example.com"
};

function mockFetch(status, fail, jsonBody) {
  const calls = [];
  const fetchImpl = (url, options) => {
    calls.push({ url, options });
    if (fail) return Promise.reject(new Error("offline"));
    const response = { status };
    if (jsonBody !== undefined) {
      response.json = () => (
        jsonBody instanceof Error ? Promise.reject(jsonBody) : Promise.resolve(jsonBody)
      );
    }
    return Promise.resolve(response);
  };
  return { fetchImpl, calls };
}

test("an unset endpoint never counts as success and does not send", async () => {
  const { fetchImpl, calls } = mockFetch(200);
  const result = await postLead("PLACEHOLDER", payload, fetchImpl);
  assert.equal(result.ok, false);
  assert.equal(result.reason, "unset");
  assert.equal(formOutcome(result), "error");
  assert.equal(calls.length, 0);
  assert.equal(endpointIsSendable(""), false);
  assert.equal(endpointIsSendable("not a url"), false);
});

test("a 2xx response with no JSON body is success", async () => {
  for (const status of [200, 201, 204, 299]) {
    const { fetchImpl, calls } = mockFetch(status);
    const result = await postLead("https://forms.example/lead", payload, fetchImpl);
    assert.equal(result.ok, true, String(status));
    assert.equal(formOutcome(result), "success");
    assert.equal(calls.length, 1);
    assert.equal(calls[0].options.method, "POST");
    const body = JSON.parse(calls[0].options.body);
    assert.equal(body.form, "spec");
    assert.equal(body.offer, "free-spec-ad");
    assert.equal(body.language, "en");
  }
});

test("FormSubmit 200 with success false is a failure and keeps the message", async () => {
  for (const flag of ["false", false]) {
    const { fetchImpl } = mockFetch(200, false, {
      success: flag,
      message: "  This form needs Activation.  "
    });
    const result = await postLead("https://formsubmit.co/ajax/owner@example.com", payload, fetchImpl);
    assert.equal(result.ok, false);
    assert.equal(result.reason, "rejected");
    assert.equal(result.status, 200);
    assert.equal(result.message, "This form needs Activation.");
    assert.equal(formOutcome(result), "error");
  }
});

test("success true is accepted as a boolean or the string true", async () => {
  for (const flag of [true, "true"]) {
    const { fetchImpl } = mockFetch(200, false, { success: flag, message: "The form was submitted successfully." });
    const result = await postLead("https://formsubmit.co/ajax/owner@example.com", payload, fetchImpl);
    assert.equal(result.ok, true);
    assert.equal(formOutcome(result), "success");
  }
});

test("a JSON body without a true success flag is not success", async () => {
  const { fetchImpl } = mockFetch(200, false, { message: "ok" });
  const result = await postLead("https://forms.example/lead", payload, fetchImpl);
  assert.equal(result.ok, false);
  assert.equal(result.reason, "rejected");
  assert.equal(result.message, "ok");
  assert.equal(formOutcome(result), "error");
});

test("a 2xx response that is not JSON still counts as success", async () => {
  const { fetchImpl } = mockFetch(200, false, new Error("not json"));
  const result = await postLead("https://forms.example/lead", payload, fetchImpl);
  assert.equal(result.ok, true);
  assert.equal(formOutcome(result), "success");
});

test("formOutcome rejects a result whose body success flag is false", async () => {
  assert.equal(formOutcome({ ok: true, status: 200, body: { success: "false", message: "no" } }), "error");
  assert.equal(formOutcome({ ok: true, status: 200, body: { success: "true" } }), "success");
  assert.equal(formOutcome({ ok: true, status: 200 }), "success");
});

test("errors, non-2xx responses, and network failures are not success", async () => {
  for (const status of [0, 199, 300, 400, 422, 500]) {
    const { fetchImpl } = mockFetch(status);
    const result = await postLead("https://forms.example/lead", payload, fetchImpl);
    assert.equal(result.ok, false, String(status));
    assert.equal(formOutcome(result), "error");
  }
  const offline = mockFetch(200, true);
  const failed = await postLead("https://forms.example/lead", payload, offline.fetchImpl);
  assert.equal(failed.ok, false);
  assert.equal(failed.reason, "network");
  assert.equal(formOutcome(failed), "error");
});
