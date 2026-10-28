/** Run only against a local server with temporary WAITLIST_DIR/CONTACT_DIR and no mail key.
 * PUBLIC_SITE_TEST_URL=http://localhost:5192 node scripts/check-public-forms.mjs
 */
import assert from "node:assert/strict";
const base = process.env.PUBLIC_SITE_TEST_URL;
if (!base || !["localhost", "127.0.0.1"].includes(new URL(base).hostname))
  throw new Error("Explicit local test URL required");
const unique = `nuro-check-${Date.now()}-${Math.random().toString(36).slice(2)}`;
const email = `${unique}@example.com`;
const send = async (path, data, method = "POST") => {
  const response = await fetch(new URL(path, base), {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return { status: response.status, body: await response.json() };
};
const invalid = await send("/api/waitlist", { email: "not-an-address" });
assert.equal(invalid.status, 400);
const attempts = await Promise.all(
  Array.from({ length: 3 }, () => send("/api/waitlist", { email })),
);
assert.deepEqual(attempts.map((x) => x.status).sort(), [200, 409, 409]);
const created = attempts.find((x) => x.status === 200).body;
assert.equal(created.ok, true);
assert.match(created.editToken, /^[a-f0-9]{64}$/);
const answers = {
  id: created.id,
  editToken: created.editToken,
  roles: ["parent", "teacher"],
  student_ages: ["6-9", "10-12"],
  message: "",
};
assert.equal(
  (
    await send(
      "/api/waitlist",
      { ...answers, editToken: "0".repeat(64) },
      "PATCH",
    )
  ).status,
  403,
);
assert.equal(
  (
    await send(
      "/api/waitlist",
      { ...answers, roles: ["administrator"] },
      "PATCH",
    )
  ).status,
  400,
);
assert.equal(
  (
    await send(
      "/api/waitlist",
      { ...answers, student_ages: ["6-9", "not-applicable"] },
      "PATCH",
    )
  ).status,
  400,
);
assert.equal((await send("/api/waitlist", answers, "PATCH")).status, 200);
assert.equal(
  (
    await send(
      "/api/waitlist",
      { ...answers, roles: ["student"], student_ages: ["16-19"] },
      "PATCH",
    )
  ).status,
  400,
);
for (const role of ["Student", "Elev", "student"]) {
  assert.equal((await send("/api/waitlist", { email: `${unique}-child@example.com`, role })).status, 400);
}
const duplicate = await send("/api/waitlist", { email: email.toUpperCase() });
assert.equal(duplicate.status, 409);
assert.equal(duplicate.body.editToken, undefined);
const legacy = await send("/api/waitlist", {
  email: `${unique}-legacy@example.com`,
  role: "Parent or guardian",
  student_ages: ["6–9 years (F–3)"],
  message: "Legacy form contract check",
});
assert.equal(legacy.status, 200);
assert.equal(
  (await send("/api/contact", { name: "", email, message: "Test" })).status,
  400,
);
assert.equal(
  (
    await send("/api/contact", {
      name: "Local integration test",
      email,
      message: "Synthetic local contact test. No email delivery configured.",
    })
  ).status,
  200,
);
console.log(
  "Form checks passed: validation, student-role rejection, atomic duplicate handling, protected updates, legacy form and contact storage.",
);
