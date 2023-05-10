const express = require("express");
const router = express.Router();
const { GoogleSpreadsheet } = require("google-spreadsheet");
const { DateTime } = require("luxon");

const sheetId = "1PLqqsULtgq2DOv0ttonmZS849hytp_ZfGFRbJNu5GwM";

router.post("/createUser", async (req, res) => {
  const user = req.body.name;
  const hashedPassword = await bcrypt.hash(req.body.password, 10);
  users.push({ user: user, password: hashedPassword });
  res.status(201).send(users);
  console.log(users);
});

router.post("/api/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    const doc = new GoogleSpreadsheet(sheetId);

    // Initialize Auth - see https://theoephraim.github.io/node-google-spreadsheet/#/getting-started/authentication
    await doc.useServiceAccountAuth({
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL_RENDER_FORM,
      private_key: process.env.GOOGLE_PRIVATE_KEY_RENDER_FORM,
    });
    await doc.loadInfo(); // loads document properties and worksheets
    const sheet = doc.sheetsByTitle["user"]; // or use doc.sheetsById[id] or doc.sheetsByTitle[title]
    const rows = await sheet.getRows();
    const match = rows.find(
      (item) => item.username === username && item.password === password
    );
    if (match) {
      return res.json({
        id: match.id,
        username,
      });
    }

    return res.sendStatus(401);
  } catch (error) {
    console.log("error", error);
    return res.sendStatus(500);
  }
});

router.get("/api/form-template", async (req, res) => {
  try {
    const { username } = req.query;
    const doc = new GoogleSpreadsheet(sheetId);
    // Initialize Auth - see https://theoephraim.github.io/node-google-spreadsheet/#/getting-started/authentication
    await doc.useServiceAccountAuth({
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL_RENDER_FORM,
      private_key: process.env.GOOGLE_PRIVATE_KEY_RENDER_FORM,
    });

    await doc.loadInfo(); // loads document properties and worksheets
    const sheetUser = doc.sheetsByTitle["user"]; // or use doc.sheetsById[id] or doc.sheetsByTitle[title]
    const rowsUser = await sheetUser.getRows();
    const user = rowsUser.find((item) => item.username === username);
    const data = [];
    const sheet = doc.sheetsByTitle["parent_form"]; // or use doc.sheetsById[id] or doc.sheetsByTitle[title]
    const rows = await (
      await sheet.getRows()
    ).map((item) => {
      if (item.category === user.category || user.category === "admin") {
        data.push({
          id_form_template: item.id_form_template,
          name_form: item.name_form,
          des_form: item.des_form,
          category: item.category,
          color: item.color,
          createdDate: item.createdDate,
          picture: item.picture,
          icon: item.icon,
        });
      }
    });
    return res.status(200).json({ data: data });
  } catch (error) {
    console.log("object :>> ", error);
    res.sendStatus(500);
  }
});

router.get("/api/form-template/:id", async (req, res) => {
  try {
    const {id} = req.params
    const doc = new GoogleSpreadsheet(sheetId);
    // Initialize Auth - see https://theoephraim.github.io/node-google-spreadsheet/#/getting-started/authentication
    await doc.useServiceAccountAuth({
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL_RENDER_FORM,
      private_key: process.env.GOOGLE_PRIVATE_KEY_RENDER_FORM,
    });
    await doc.loadInfo(); // loads document properties and worksheets
    const sheet = doc.sheetsByTitle["form_template"]; // or use doc.sheetsById[id] or doc.sheetsByTitle[title]
    const data = [];
    const rows = await (
      await sheet.getRows()
    ).map((item) => {
      if (item.id_form_template === id) {
        data.push({
          id_form_template: item.id_form_template,
          name_form: item.name_form,
          des_form: item.des_form,
          step: item.step,
          id_field: item.id_field,
          name_field: item.name_field,
          condition_true: item.condition_true,
          field: item.field,
          type: item.type,
          require: item.require,
          option: item.option,
          placeholder: item.placeholder,
          status: item.status,
          createdDate: item.createdDate,
          picture: item.picture,
          countingKey: item.counting_key,
        });
      }
    });
    return res.status(200).json({ data });
  } catch (error) {
    console.log("object :>> ", error);
    res.sendStatus(500);
  }
});

router.get("/api/form-list", async (req, res) => {
  try {
    const doc = new GoogleSpreadsheet(sheetId);

    // Initialize Auth - see https://theoephraim.github.io/node-google-spreadsheet/#/getting-started/authentication
    await doc.useServiceAccountAuth({
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL_RENDER_FORM,
      private_key: process.env.GOOGLE_PRIVATE_KEY_RENDER_FORM,
    });

    await doc.loadInfo(); // loads document properties and worksheets
    const sheet = doc.sheetsByTitle["form_submitted"];
    const rows = await (
      await sheet.getRows()
    ).map((item) => ({
      idFormTemplate: item.id_form_template,
      formName: item.name_form,
      formId: item.id_form,
      username: item.user_name,
      userId: item.user_id,
      created_date: item.created_date,
    }));
    return res.status(200).json({ data: rows });
  } catch (error) {
    console.log("object :>> ", error);
    res.sendStatus(500);
  }
});

router.get("/api/form-value/:formId", async (req, res) => {
  try {
    const { formId } = req.params;
    const doc = new GoogleSpreadsheet(sheetId);

    // Initialize Auth - see https://theoephraim.github.io/node-google-spreadsheet/#/getting-started/authentication
    await doc.useServiceAccountAuth({
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL_RENDER_FORM,
      private_key: process.env.GOOGLE_PRIVATE_KEY_RENDER_FORM,
    });

    await doc.loadInfo(); // loads document properties and worksheets
    const sheet = doc.sheetsByTitle["form_values"];
    const sheetForm = doc.sheetsByTitle["form_submitted"];
    const [rowsForm, rows] = await Promise.all([
      (
        await sheetForm.getRows()
      ).map((item) => ({
        idFormTemplate: item.id_form_template,
        formName: item.name_form,
        formId: item.id_form,
        username: item.user_name,
        userId: item.user_id,

        created_date: item.created_date,
      })),
      (
        await sheet.getRows()
      ).map((item) => ({
        idForm: item.id_form,
        idField: item.id_field,
        nameField: item.name_field,
        value: item.value,
      })),
    ]);
    const form = rowsForm.filter((item) => item.formId === formId);

    const result = rows.filter((item) => item.idForm === formId);
    return res.status(200).json({ form: form?.[0] || {}, data: result });
  } catch (error) {
    console.log("object :>> ", error);
    res.sendStatus(500);
  }
});

router.post("/api/form", async (req, res) => {
  try {
    const { data, formId, formName, userId, userName, idFormTemplate } =
      req.body;
    const doc = new GoogleSpreadsheet(sheetId);

    // Initialize Auth - see https://theoephraim.github.io/node-google-spreadsheet/#/getting-started/authentication
    await doc.useServiceAccountAuth({
      // env var values are copied from service account credentials generated by google
      // see "Authentication" section in docs for more info
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL_RENDER_FORM,
      private_key: process.env.GOOGLE_PRIVATE_KEY_RENDER_FORM,
    });
    await doc.loadInfo(); // loads document properties and worksheets
    const sheet = doc.sheetsByTitle["form_values"];
    sheet.addRows(data);
    const sheet2 = doc.sheetsByTitle["form_submitted"];
    const date = DateTime.local();
    var rezoned = date.setZone("Asia/Ho_Chi_Minh");
    sheet2.addRow({
      id_form: formId,
      id_form_template: idFormTemplate,
      name_form: formName,
      user_id: userId,
      user_name: userName,
      // created_date: format(new Date(), "dd/MM/yyyy , HH:mm"),
      created_date: rezoned.toFormat("dd/MM/yyy, HH:mm"),
    });
    return res.sendStatus(200);
  } catch (error) {
    return res.sendStatus(500);
  }
});

module.exports = router;
