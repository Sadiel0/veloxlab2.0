/* Lead delivery. A thank-you is allowed only after a 2xx response whose
   JSON, when present, has success true or "true". FormSubmit often returns
   HTTP 200 with { success: "false", message } — that is a failure. */
(function (root) {
  function endpointIsSendable(endpoint) {
    return typeof endpoint === "string" && /^https?:\/\/\S+$/i.test(endpoint);
  }

  function messageFrom(body) {
    if (!body || typeof body !== "object") return "";
    if (typeof body.message !== "string") return "";
    return body.message.trim();
  }

  /* No JSON body is success. A JSON body counts only when success is
     boolean true or the string "true". */
  function jsonAllowsSuccess(body) {
    if (body == null) return true;
    if (typeof body !== "object" || Array.isArray(body)) return false;
    if (!Object.prototype.hasOwnProperty.call(body, "success")) return false;
    return body.success === true || body.success === "true";
  }

  function postLead(endpoint, payload, fetchImpl) {
    if (!endpointIsSendable(endpoint)) {
      return Promise.resolve({ ok: false, reason: "unset" });
    }
    var send = fetchImpl || root.fetch;
    return Promise.resolve()
      .then(function () {
        return send(endpoint, {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json"
          },
          body: JSON.stringify(payload)
        });
      })
      .then(function (response) {
        var status = response && response.status;
        var httpOk = status >= 200 && status < 300;
        var read = response && typeof response.json === "function"
          ? Promise.resolve().then(function () { return response.json(); }).catch(function () { return null; })
          : Promise.resolve(null);
        return read.then(function (body) {
          var message = messageFrom(body);
          if (!httpOk) {
            var httpResult = { ok: false, reason: "http", status: status };
            if (message) httpResult.message = message;
            return httpResult;
          }
          if (!jsonAllowsSuccess(body)) {
            var rejected = { ok: false, reason: "rejected", status: status };
            if (message) rejected.message = message;
            return rejected;
          }
          return { ok: true, status: status };
        });
      })
      .catch(function () {
        return { ok: false, reason: "network" };
      });
  }

  function formOutcome(result) {
    if (!result || result.ok !== true) return "error";
    if (Object.prototype.hasOwnProperty.call(result, "body") && !jsonAllowsSuccess(result.body)) return "error";
    return "success";
  }

  var api = {
    endpointIsSendable: endpointIsSendable,
    postLead: postLead,
    formOutcome: formOutcome
  };
  root.VELOX_FORMS = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof window !== "undefined" ? window : globalThis);
