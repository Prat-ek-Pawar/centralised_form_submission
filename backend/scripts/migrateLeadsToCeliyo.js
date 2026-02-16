const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");
const FormSubmission = require("../models/formSubmission");
const fs = require("fs");

dotenv.config({ path: path.join(__dirname, "../..", ".env") });

const CELIYO_CLIENT_ID = "a2e075a0-2ce1-450c-95ce-91bca340cea8";
const LOGIN_URL = "https://admin.celiyo.com/api/auth/login/";
const LEAD_URL = "https://crm.celiyo.com/api/crm/leads/";

const CREDENTIALS = {
  email: process.env.CELIYO_ADMIN_EMAIL,
  password: process.env.CELIYO_ADMIN_PASSWORD,
};

async function migrateLeads() {
  console.log("Starting Migration Script for Celiyo...");

  if (!process.env.MONGO_URI) {
    console.error("MONGO_URI is missing in .env file");
    process.exit(1);
  }

  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");
  } catch (err) {
    console.error("Database connection error:", err);
    process.exit(1);
  }

  try {
    const loginResponse = await fetch(LOGIN_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(CREDENTIALS),
    });

    if (!loginResponse.ok) {
      throw new Error(`Login failed: ${await loginResponse.text()}`);
    }

    const loginData = await loginResponse.json();
    const accessToken = loginData.tokens?.access;
    const userId = loginData.user?.id;
    const tenantId = loginData.user?.tenant;
    const tenantSlug = loginData.user?.tenant_slug || "nuviwellness";

    if (!accessToken) {
      throw new Error("No access token received.");
    }
    console.log("Authentication successful.");

    console.log(
      "Fetching existing leads from Celiyo to check for duplicates..."
    );
    let existingLeadsSet = new Set();
    try {
      let nextUrl = LEAD_URL;
      const res = await fetch(nextUrl, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
          "X-Tenant-Id": tenantId,
          "X-Tenant-Slug": tenantSlug,
        },
      });

      if (res.ok) {
        const data = await res.json();
        const leadsList = Array.isArray(data) ? data : data.results || [];
        leadsList.forEach((l) => {
          if (l.phone) existingLeadsSet.add(l.phone);
        });
        console.log(`Found ${existingLeadsSet.size} existing leads in Celiyo.`);
      } else {
        console.warn(
          "Could not fetch existing leads. Duplicates might occur.",
          res.status
        );
      }
    } catch (e) {
      console.error("Error fetching existing leads:", e.message);
    }

    const leads = await FormSubmission.find({ clientID: CELIYO_CLIENT_ID });
    console.log(
      `Found ${leads.length} leads for clientID: ${CELIYO_CLIENT_ID} in local DB.`
    );

    if (leads.length === 0) {
      console.log("No leads to migrate.");
      process.exit(0);
    }

    let successCount = 0;
    let failCount = 0;
    let skippedCount = 0;

    for (const [index, lead] of leads.entries()) {
      const formData = lead.data || {};

      let leadName = formData.name || formData.fullName || formData.Name;
      if (!leadName) {
        if (formData.fname || formData.lname) {
          leadName = `${formData.fname || ""} ${formData.lname || ""}`.trim();
        } else if (formData.firstName || formData.lastName) {
          leadName = `${formData.firstName || ""} ${
            formData.lastName || ""
          }`.trim();
        } else if (formData["First Name"] || formData["Last Name"]) {
          leadName = `${formData["First Name"] || ""} ${
            formData["Last Name"] || ""
          }`.trim();
        }
      }
      if (!leadName) leadName = "Unknown Name";

      const leadPayload = {
        name: leadName,
        phone:
          formData.phone ||
          formData.mobile ||
          formData.phoneNumber ||
          formData.Mobile ||
          "",
        email: formData.email || formData.Email || "",
        title: formData.service || formData.Service || formData.title || "",
        owner_user_id: userId,
        assigned_to: userId,
      };

      if (!leadPayload.phone) {
        const skippedMsg = `[${index + 1}/${leads.length}] Skipped lead ${
          lead._id
        }: No phone number.\n`;
        fs.appendFileSync("migration_errors.log", skippedMsg);
        skippedCount++;
        continue;
      }

      if (existingLeadsSet.has(leadPayload.phone)) {
        skippedCount++;
        continue;
      }

      try {
        const response = await fetch(LEAD_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
            "X-Tenant-Id": tenantId,
            "X-Tenant-Slug": tenantSlug,
          },
          body: JSON.stringify(leadPayload),
        });

        if (!response.ok) {
          const errText = await response.text();
          throw new Error(`Status ${response.status}: ${errText}`);
        }

        console.log(
          `[${index + 1}/${leads.length}] Successfully migrated lead: ${
            lead._id
          }`
        );
        successCount++;
        existingLeadsSet.add(leadPayload.phone);
      } catch (err) {
        const errorMsg = `[${index + 1}/${
          leads.length
        }] Failed to migrate lead ${lead._id}: ${err.message}\n`;
        console.error(errorMsg);
        fs.appendFileSync("migration_errors.log", errorMsg);
        failCount++;
      }

      await new Promise((resolve) => setTimeout(resolve, 200));
    }

    console.log("\nMigration Completed.");
    console.log(`Success: ${successCount}`);
    console.log(`Skipped: ${skippedCount}`);
    console.log(`Failed: ${failCount}`);
  } catch (error) {
    console.error("Migration fatal error:", error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

migrateLeads();
