/* Lead delivery. A thank-you is allowed only after a 2xx response. */
(function (root) {
  function endpointIsSendable(endpoint) {
    return typeof endpoint === "string" && /^https?:\/\/\S+$/i.test(endpoint);
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
        if (status >= 200 && status < 300) return { ok: true, status: status };
        return { ok: false, reason: "http", status: status };
      })
      .catch(function () {
        return { ok: false, reason: "network" };
      });
  }

  function formOutcome(result) {
    return result && result.ok === true ? "success" : "error";
  }

  var api = {
    endpointIsSendable: endpointIsSendable,
    postLead: postLead,
    formOutcome: formOutcome
  };
  root.VELOX_FORMS = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof window !== "undefined" ? window : globalThis);
