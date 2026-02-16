const CELIYO_CLIENT_ID = "a2e075a0-2ce1-450c-95ce-91bca340cea8";
const LOGIN_URL = "https://admin.celiyo.com/api/auth/login/";
const LEAD_URL = "https://crm.celiyo.com/api/crm/leads/";

const CREDENTIALS = {
  email: process.env.CELIYO_ADMIN_EMAIL,
  password: process.env.CELIYO_ADMIN_PASSWORD,
};

async function handleCeliyoIntegration(formData) {
  try {
    const loginResponse = await fetch(LOGIN_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(CREDENTIALS),
    });

    if (!loginResponse.ok) {
      const errorText = await loginResponse.text();
      throw new Error(
        `Login failed with status ${loginResponse.status}: ${errorText}`
      );
    }

    const loginData = await loginResponse.json();
    const accessToken = loginData.tokens?.access;
    const userId = loginData.user?.id;
    const tenantId = loginData.user?.tenant;
    const tenantSlug = loginData.user?.tenant_slug || "nuviwellness";

    if (!accessToken) {
      throw new Error("No access token received from login response.");
    }

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
      console.warn(
        "Skipping Celiyo submission: Phone number missing in form data."
      );
      return;
    }

    const leadResponse = await fetch(LEAD_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
        "X-Tenant-Id": tenantId,
        "X-Tenant-Slug": tenantSlug,
      },
      body: JSON.stringify(leadPayload),
    });

    if (!leadResponse.ok) {
      const errorText = await leadResponse.text();
      throw new Error(
        `Lead creation failed with status ${leadResponse.status}: ${errorText}`
      );
    }

    const leadResult = await leadResponse.json();
    console.log("Celiyo Lead created successfully:", leadResult);
    return leadResult;
  } catch (error) {
    console.error("Celiyo Integration Error:", error.message);
  }
}

module.exports = {
  CELIYO_CLIENT_ID,
  handleCeliyoIntegration,
};
