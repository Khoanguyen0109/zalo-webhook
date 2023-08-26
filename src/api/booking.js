const express = require("express");
const router = express.Router();
const { GoogleSpreadsheet } = require("google-spreadsheet");

const { v4: uuidv4 } = require("uuid");
const { DateTime } = require("luxon");

const sheetId = "1ZfiCYOUYQ9hmTr5ruDWINu8-DIQIkICrEmW7BFHTvrA";

const getBookedSeats = async (id_xuat_chieu) => {
  const doc = new GoogleSpreadsheet(sheetId);
  // Initialize Auth - see https://theoephraim.github.io/node-google-spreadsheet/#/getting-started/authentication
  await doc.useServiceAccountAuth({
    client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL_RENDER_FORM,
    private_key: process.env.GOOGLE_PRIVATE_KEY_RENDER_FORM,
  });
  await doc.loadInfo(); // loads document properties and worksheets
  const allTicketsSheet = doc.sheetsByTitle["dat_ve"]; // or use doc.sheetsById[id] or doc.sheetsByTitle[title]
  const detailsSheet = doc.sheetsByTitle["chi_tiet_dat_ve"];
  const tickets = await (
    await allTicketsSheet.getRows()
  ).map((item) => ({
    id_ve: item.id_ve,
    id_xuat_chieu: item.id_xuat_chieu,
    thoi_gian_dat: item.thoi_gian_dat,
    so_dien_thoai: item.so_dien_thoai,
    nguoi_dat: item.nguoi_dat,
    email: item.email,
    so_luong_ghe: item.so_luong_ghe,
    tong_tien: item.tong_tien,
    trang_thai: item.trang_thai,
  }));

  const ticketIds = tickets
    .filter((tic) => tic?.id_xuat_chieu.toString() === id_xuat_chieu.toString())
    .map((item) => item.id_ve);
  const details = await (
    await detailsSheet.getRows()
  ).map((item) => ({
    id_ve: item.id_ve,
    ma_ghe: item.ma_ghe,
  }));

  const bookedSeats = [];
  details.forEach((detail) => {
    if (ticketIds.includes(detail.id_ve)) {
      bookedSeats.push(detail.ma_ghe);
    }
  });
  return bookedSeats;
};

router.post("/check-booked", async (req, res, next) => {
  try {
    const { seats, play } = req.body;

    const bookedSeats = await getBookedSeats(play);
    const bookedError = [];
    if (!seats || seats.length === 0) {
      return res.status(400).json({ booked: [] });
    }
    seats.forEach((item) => {
      if (bookedSeats.includes(item)) {
        bookedError.push(item);
      }
    });
    if (bookedError.length > 0) {
      return res.status(400).json({ booked: bookedError });
    }
    return res.status(200).json({ status: 200, data: "success" });
  } catch (error) {
    next(error);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const { seats, name, email, phone, play, tong_tien } = req.body;
    const bookedSeats = await getBookedSeats(play);
    const bookedError = [];
    if (!seats || seats.length === 0) {
      return res.status(400).json({ booked: [] });
    }
    seats.forEach((item) => {
      if (bookedSeats.includes(item)) {
        bookedError.push(item);
      }
    });
    if (bookedError.length > 0) {
      return res.status(400).json({ booked: bookedError });
    }
    const doc = new GoogleSpreadsheet(sheetId);
    await doc.useServiceAccountAuth({
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL_RENDER_FORM,
      private_key: process.env.GOOGLE_PRIVATE_KEY_RENDER_FORM,
    });
    await doc.loadInfo(); // loads document properties and worksheets
    const sheet = doc.sheetsByTitle["dat_ve"]; // or use doc.sheetsById[id] or doc.sheetsByTitle[title]
    const details = doc.sheetsByTitle["chi_tiet_dat_ve"]; // or use doc.sheetsById[id] or doc.sheetsByTitle[title]

    const date = DateTime.local();
    var rezoned = date.setZone("Asia/Ho_Chi_Minh");
    const id_ve = uuidv4();
    await sheet.addRow({
      id_ve,
      thoi_gian_dat: rezoned.toFormat("dd/MM/yyyy, HH:mm"),
      id_xuat_chieu: play,
      so_dien_thoai: phone,
      nguoi_dat: name,
      email: email,
      so_luong_ghe: seats.length,
      tong_tien: tong_tien,
    });

    seats.forEach((item) => {
      details.addRow({
        id_ve,
        ma_ghe: item,
      });
    });
    return res.status(200).json({ status: 200, data: "success" });
  } catch (error) {
    next(error);
  }
});

router.post("/check-voucher", async (req, res, next) => {
  try {
    const { voucher } = req.body;
    const doc = new GoogleSpreadsheet(sheetId);
    await doc.useServiceAccountAuth({
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL_RENDER_FORM,
      private_key: process.env.GOOGLE_PRIVATE_KEY_RENDER_FORM,
    });
    await doc.loadInfo(); // loads document properties and worksheets
    const sheet = doc.sheetsByTitle["voucher"]; // or
    const rows = await (
      await sheet.getRows()
    ).map((item) => ({
      code_voucher: item.code_voucher,
      gia_giam: item.gia_giam,
      exp: item.exp,
    }));
    const date = DateTime.local();
    var rezoned = date.setZone("Asia/Ho_Chi_Minh");
    const discountItem = rows.find(
      (item) =>
        item.code_voucher === voucher && new DateTime(item.exp) >= rezoned
    );
    if (discountItem) {
      return res
        .status(200)
        .json({ status: 200, discount: discountItem.gia_giam });
    } else {
      return res.status(404).json({ status: 404, discount: null });
    }
  } catch (error) {
    next(error);
  }
});

router.get("/seats", async (req, res, next) => {
  try {
    const doc = new GoogleSpreadsheet(sheetId);
    // Initialize Auth - see https://theoephraim.github.io/node-google-spreadsheet/#/getting-started/authentication
    await doc.useServiceAccountAuth({
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL_RENDER_FORM,
      private_key: process.env.GOOGLE_PRIVATE_KEY_RENDER_FORM,
    });
    await doc.loadInfo(); // loads document properties and worksheets
    const sheet = doc.sheetsByTitle["gia_ve"]; // or use doc.sheetsById[id] or doc.sheetsByTitle[title]
    const rows = await (
      await sheet.getRows()
    ).map((item) => ({
      ma_ghe: item.ma_ghe,
      gia_ve: item.gia_ve.replace(",", "").replace(".", ","),
    }));
    return res.status(200).json({ data: rows });
  } catch (error) {
    next(error);
  }
});

router.get("/show-times", async (req, res, next) => {
  try {
    const doc = new GoogleSpreadsheet(sheetId);
    // Initialize Auth - see https://theoephraim.github.io/node-google-spreadsheet/#/getting-started/authentication
    await doc.useServiceAccountAuth({
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL_RENDER_FORM,
      private_key: process.env.GOOGLE_PRIVATE_KEY_RENDER_FORM,
    });
    await doc.loadInfo(); // loads document properties and worksheets
    const sheet = doc.sheetsByTitle["xuat_chieu"]; // or use doc.sheetsById[id] or doc.sheetsByTitle[title]
    const rows = await (
      await sheet.getRows()
    ).map((item) => ({
      id_xuat_chieu: item.id_xuat_chieu,
      ten_phim_kich: item.ten_phim_kich,
      ngay_chieu: item.ngay_chieu,
      gio_chieu: item.gio_chieu,
    }));
    return res.status(200).json({ data: rows });
  } catch (error) {
    next(error);
  }
});

router.get("/booked-seats/:id_xuat_chieu", async (req, res, next) => {
  try {
    const { id_xuat_chieu } = req.params;
    const bookedSeats = await getBookedSeats(id_xuat_chieu);
    return res.status(200).json({ data: bookedSeats });
  } catch (error) {
    next(error);
  }
});

router.get("/info", async (req, res, next) => {
  try {
    const doc = new GoogleSpreadsheet(sheetId);
    await doc.useServiceAccountAuth({
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL_RENDER_FORM,
      private_key: process.env.GOOGLE_PRIVATE_KEY_RENDER_FORM,
    });
    await doc.loadInfo(); // loads document properties and worksheets
    const sheet = doc.sheetsByTitle["thong_tin"];
    const rows = await sheet.getRows(); // can pass in { limit, offset }
    if (rows.length > 0) {
      const banner = rows[0].banner;
      return res.status(200).json({
        data: {
          banner,
          bank: rows[0]?.bank || "",
          stk: rows[0]?.stk || "",
          account: rows[0]?.account || "",
        },
      });
    }
    return res.sendStatus(404);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
