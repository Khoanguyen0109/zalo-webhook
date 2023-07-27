const express = require("express");
const router = express.Router();
const { GoogleSpreadsheet } = require("google-spreadsheet");
const { format, toDate } = require("date-fns");
const moment = require("moment-timezone");
const { v4: uuidv4 } = require("uuid");

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
    .filter((tic) => tic?.id_xuat_chieu.toString() === id_xuat_chieu)
    .map((item) => item.id_ve);
  console.log("ticketIds", ticketIds);
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
router.post("/", async (req, res) => {
  const { seats, name, email, phone, play, tong_tien } = req.body;
  const bookedSeats = await getBookedSeats(id_xuat_chieu);
  const bookedError = [];
  seats.forEach((item) => {
    if (bookedSeats.includes(seats)) {
      bookedError.push(seats);
    }
  });
  if (bookedError.length > 0) {
    res.status(400).json({ booked: bookedError });
  }
  const doc = new GoogleSpreadsheet(sheetId);
  await doc.useServiceAccountAuth({
    client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL_RENDER_FORM,
    private_key: process.env.GOOGLE_PRIVATE_KEY_RENDER_FORM,
  });
  await doc.loadInfo(); // loads document properties and worksheets
  const sheet = doc.sheetsByTitle["dat_ve"]; // or use doc.sheetsById[id] or doc.sheetsByTitle[title]
  const date = DateTime.local();
  var rezoned = date.setZone("Asia/Ho_Chi_Minh");

  await sheet.addRow({
    id_ve: uuidv4(),
    thoi_gian_dat: rezoned.toFormat("dd/MM/yyy, HH:mm"),
    id_xuat_chieu: play,
    so_dien_thoai: phone,
    nguoi_dat: name,
    email: email,
    so_luong_ghe: seats.length,
    tong_tien: tong_tien,
  });
  return res.sendStatus(200);
});

router.get("/seats", async (req, res) => {
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
      gia_ve: item.gia_ve,
    }));
    return res.status(200).json({ data: rows });
  } catch (error) {
    console.log("object :>> ", error);
    res.sendStatus(500);
  }
});

router.get("/show-times", async (req, res) => {
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
    console.log("object :>> ", error);
    res.sendStatus(500);
  }
});

router.get("/booked-seats/:id_xuat_chieu", async (req, res) => {
  try {
    const { id_xuat_chieu } = req.params;
    const bookedSeats = await getBookedSeats(id_xuat_chieu);
    return res.status(200).json({ data: bookedSeats });
  } catch (error) {
    console.log("object :>> ", error);
    res.sendStatus(500);
  }
});

module.exports = router;