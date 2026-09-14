/**
 * End-to-end API test script.
 *
 * Covers Task 2 (auth) and Task 7 (full incident flow) from the project brief.
 * Run the server first (`npm run dev`), then in another terminal:
 *
 *   node scripts/test-api.mjs
 *
 * Requires a real MONGO_URI in .env — this hits a live server + database,
 * it does not mock anything. Safe to re-run: every user is created with a
 * unique, timestamped email.
 */

const BASE = process.env.API_BASE || "http://localhost:5000/api";
const stamp = Date.now();

let passed = 0;
let failed = 0;

function check(label, condition, extra = "") {
  if (condition) {
    passed++;
    console.log(`  \x1b[32m✓\x1b[0m ${label}`);
  } else {
    failed++;
    console.log(`  \x1b[31m✗\x1b[0m ${label} ${extra}`);
  }
}

async function req(method, path, { token, body, isForm } = {}) {
  const headers = {};
  if (token) headers.Authorization = `Bearer ${token}`;
  let payload = body;
  if (body && !isForm) {
    headers["Content-Type"] = "application/json";
    payload = JSON.stringify(body);
  }
  const res = await fetch(`${BASE}${path}`, { method, headers, body: payload });
  let json = null;
  try {
    json = await res.json();
  } catch {
    /* no body */
  }
  return { status: res.status, json };
}

async function main() {
  console.log(`\nRunning against ${BASE}\n`);

  // ---------------- AUTH ----------------
  console.log("Auth: registration & login");

  const citizenEmail = `citizen.${stamp}@example.com`;
  const citizenPassword = "Password123!";

  const reg1 = await req("POST", "/auth/register", {
    body: { fullName: "Test Citizen", email: citizenEmail, password: citizenPassword, role: "citizen" },
  });
  check("Citizen registration returns 201", reg1.status === 201, JSON.stringify(reg1.json));
  check("Registration response has a token", Boolean(reg1.json?.token));
  check("Registration response never includes passwordHash", !("passwordHash" in (reg1.json?.user || {})));
  const citizenToken = reg1.json?.token;
  const citizenId = reg1.json?.user?._id;

  const dup = await req("POST", "/auth/register", {
    body: { fullName: "Dup", email: citizenEmail, password: "whatever123", role: "citizen" },
  });
  check("Duplicate email registration returns 409", dup.status === 409);

  const badLogin = await req("POST", "/auth/login", {
    body: { identifier: citizenEmail, password: "wrong-password" },
  });
  check("Login with wrong password returns 401", badLogin.status === 401);

  const goodLogin = await req("POST", "/auth/login", {
    body: { identifier: citizenEmail, password: citizenPassword },
  });
  check("Login with correct password returns 200", goodLogin.status === 200);
  check("Login response has a token", Boolean(goodLogin.json?.token));

  const me = await req("GET", "/auth/me", { token: citizenToken });
  check("/me with valid token returns 200", me.status === 200);
  check("/me returns the correct user", me.json?.user?.email === citizenEmail);

  const meNoToken = await req("GET", "/auth/me");
  check("/me with no token returns 401", meNoToken.status === 401);

  const meBadToken = await req("GET", "/auth/me", { token: "not-a-real-token" });
  check("/me with invalid token returns 401", meBadToken.status === 401);

  // Second citizen + rescue + admin, needed for permission tests below
  const citizen2Email = `citizen2.${stamp}@example.com`;
  const reg2 = await req("POST", "/auth/register", {
    body: { fullName: "Second Citizen", email: citizen2Email, password: citizenPassword, role: "citizen" },
  });
  const citizen2Token = reg2.json?.token;

  const rescueEmail = `rescue.${stamp}@example.com`;
  const regRescue = await req("POST", "/auth/register", {
    body: { fullName: "Test Rescue", email: rescueEmail, password: citizenPassword, role: "rescue" },
  });
  const rescueToken = regRescue.json?.token;

  const adminEmail = `admin.${stamp}@example.com`;
  const regAdmin = await req("POST", "/auth/register", {
    body: { fullName: "Test Admin", email: adminEmail, password: citizenPassword, role: "admin" },
  });
  const adminToken = regAdmin.json?.token;
  check("Rescue + admin test accounts created", Boolean(rescueToken && adminToken));

  // ---------------- INCIDENTS ----------------
  console.log("\nIncidents: create, read, permissions, update, delete");

  const createRes = await req("POST", "/incidents", {
    token: citizenToken,
    body: {
      type: "Flood",
      severity: "Critical",
      description: "Water rising fast near the riverside colony.",
      location: "Velachery Main Road, Chennai",
      latitude: 12.9791,
      longitude: 80.2211,
      peopleAffected: 4,
    },
  });
  check("Create incident returns 201", createRes.status === 201, JSON.stringify(createRes.json));
  check("New incident defaults to status Reported", createRes.json?.incident?.status === "Reported");
  check("New incident is linked to the reporter", createRes.json?.incident?.reporter?.email === citizenEmail);
  const incidentId = createRes.json?.incident?._id;

  // ---- Image upload (Task 5) ----
  console.log("\nIncidents: image upload");

  // A minimal valid 1x1 transparent PNG, so this test doesn't depend on any
  // file existing on disk.
  const tinyPngBase64 =
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=";
  const pngBytes = Buffer.from(tinyPngBase64, "base64");

  const formWithImage = new FormData();
  formWithImage.append("type", "Fire");
  formWithImage.append("severity", "Medium");
  formWithImage.append("description", "Small kitchen fire, contained but smoke damage visible.");
  formWithImage.append("location", "Anna Nagar, Chennai");
  formWithImage.append("image", new Blob([pngBytes], { type: "image/png" }), "scene.png");

  const withImageRes = await req("POST", "/incidents", { token: citizenToken, body: formWithImage, isForm: true });
  check("Create incident with a valid image returns 201", withImageRes.status === 201, JSON.stringify(withImageRes.json));
  check(
    "Incident stores an image path",
    Array.isArray(withImageRes.json?.incident?.images) && withImageRes.json.incident.images.length === 1
  );
  const imageUrl = withImageRes.json?.incident?.images?.[0];
  const imageIncidentId = withImageRes.json?.incident?._id;

  if (imageUrl) {
    const imageFetch = await fetch(`${BASE.replace(/\/api$/, "")}${imageUrl}`);
    check("Uploaded image is retrievable via its stored URL", imageFetch.status === 200);
  }

  const formWithBadFile = new FormData();
  formWithBadFile.append("type", "Fire");
  formWithBadFile.append("severity", "Low");
  formWithBadFile.append("description", "Testing rejected file type.");
  formWithBadFile.append("location", "Test location");
  formWithBadFile.append(
    "image",
    new Blob([Buffer.from("not really an image")], { type: "text/plain" }),
    "not-an-image.txt"
  );

  const badFileRes = await req("POST", "/incidents", { token: citizenToken, body: formWithBadFile, isForm: true });
  check("Non-image file upload is rejected (400)", badFileRes.status === 400);

  // Clean up the extra incident created for the image test so it doesn't
  // linger in the DB across repeated test runs.
  if (imageIncidentId) {
    await req("DELETE", `/incidents/${imageIncidentId}`, { token: adminToken });
  }


  const noAuthCreate = await req("POST", "/incidents", {
    body: { type: "Flood", severity: "Low", description: "x", location: "x" },
  });
  check("Create incident with no token returns 401", noAuthCreate.status === 401);

  const listMine = await req("GET", "/incidents", { token: citizenToken });
  check("Citizen incident list returns 200", listMine.status === 200);
  check(
    "Citizen only sees their own incidents",
    listMine.json?.incidents?.every((i) => i.reporter?.email === citizenEmail)
  );

  const getOne = await req("GET", `/incidents/${incidentId}`, { token: citizenToken });
  check("Owner can fetch their incident by id", getOne.status === 200);

  const otherCitizenGet = await req("GET", `/incidents/${incidentId}`, { token: citizen2Token });
  check("A different citizen cannot view someone else's incident (403)", otherCitizenGet.status === 403);

  const otherCitizenEdit = await req("PUT", `/incidents/${incidentId}`, {
    token: citizen2Token,
    body: { description: "trying to tamper with someone else's report" },
  });
  check("A different citizen cannot edit someone else's incident (403)", otherCitizenEdit.status === 403);

  const adminList = await req("GET", "/incidents", { token: adminToken });
  check("Admin sees all incidents, not just their own", adminList.status === 200 && adminList.json?.count >= 1);

  const rescueVerify = await req("PUT", `/incidents/${incidentId}`, {
    token: rescueToken,
    body: { status: "Verified", severity: "High" },
  });
  check("Rescue can update status and severity", rescueVerify.status === 200);
  check("Status actually changed to Verified", rescueVerify.json?.incident?.status === "Verified");

  const ownerEditAfterVerify = await req("PUT", `/incidents/${incidentId}`, {
    token: citizenToken,
    body: { description: "trying to edit after verification" },
  });
  check("Owner can no longer edit after it's verified (400)", ownerEditAfterVerify.status === 400);

  const invalidStatus = await req("PUT", `/incidents/${incidentId}`, {
    token: rescueToken,
    body: { status: "not-a-real-status" },
  });
  check("Invalid status value is rejected (400)", invalidStatus.status === 400);

  const rescueDelete = await req("DELETE", `/incidents/${incidentId}`, { token: rescueToken });
  check("Rescue cannot delete an incident (403)", rescueDelete.status === 403);

  const citizenDelete = await req("DELETE", `/incidents/${incidentId}`, { token: citizenToken });
  check("Citizen cannot delete an incident (403)", citizenDelete.status === 403);

  const adminDelete = await req("DELETE", `/incidents/${incidentId}`, { token: adminToken });
  check("Admin can delete an incident", adminDelete.status === 200);

  const getDeleted = await req("GET", `/incidents/${incidentId}`, { token: adminToken });
  check("Deleted incident returns 404 afterward", getDeleted.status === 404);

  // ---------------- SUMMARY ----------------
  console.log(`\n${passed} passed, ${failed} failed\n`);
  if (failed > 0) process.exit(1);
}

main().catch((err) => {
  console.error("Test script crashed:", err);
  process.exit(1);
});
