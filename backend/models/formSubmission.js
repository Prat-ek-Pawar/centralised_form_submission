const mongoose = require("mongoose");

const formSubmissionSchema = new mongoose.Schema(
    {
        clientID: {
            type: String,
            required: true
        },
        data: {
            type: mongoose.Schema.Types.Mixed,
            required: true
        }
    },
    {
        timestamps: true
    }
);

const FormSubmission = mongoose.model("FormSubmission", formSubmissionSchema, "formsubmissions");

module.exports = FormSubmission;
