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

function mockFetch(status, fail) {
  const calls = [];
  const fetchImpl = (url, options) => {
    calls.push({ url, options });
    if (fail) return Promise.reject(new Error("offline"));
    return Promise.resolve({ status });
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

test("success is only a 2xx response", async () => {
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
