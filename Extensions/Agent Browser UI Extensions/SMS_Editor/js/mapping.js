var incFields = [
    {
        recipients: {
            incField: "name_and_phone_sms"
        }

    },
    {
        smsContent: {
            incField: "content_sms"
        }
    },
    {
        flag: {
            incField: "sms_online_notification",
            defaultValue: true
        }
    }
];

var customNotificationMapping = [
    {
        "column": "ReportID",
        "attr": "report_id"
    },
    {
        "column": "Category ID",
        "attr": "cat_id"
    }
];

var stdTextForInc = [
    {
        "column": "standardtextname",
        "attr": "name"
    },
    {
        "column": "standardtextbody",
        "attr": "value"
    }
];