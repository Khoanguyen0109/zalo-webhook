const axios = require("axios").default;
require("dotenv").config();
const { format, startOfMonth, endOfMonth } = require("date-fns");
const { getDoc, authConfig, sleep } = require("./utils");
const { getInvoice, getTotalInvoice } = require("./api");

const addNewInvoice = async () => {
  const start = Date.now();
  console.log("Update Invoice");

  try {
    const data = await axios.get(
      "https://script.google.com/macros/s/AKfycbzwIkiHFVQ4IPoO-ufXwrxm4bVNgblTy4RViHXq1shvOtQfF6P-5va1cTyNySdcaOWs/exec"
    );
    const { id_sheet_1, id_sheet_2, client_email, private_key } =
      data.data.data[0];
    const doc = await getDoc(id_sheet_2, client_email, private_key);
    const auth = await axios(authConfig);
    const accessToken = auth.data.access_token;
    const authHeader = {
      headers: {
        Authorization: "Bearer " + accessToken, //the token is a variable which holds the token
        Retailer: "denio",
      },
    };
    sleep(1000);
    const sheet = doc.sheetsByIndex[0];
    const totalInvoice = await getTotalInvoice(authHeader, {
      fromPurchaseDate: startOfMonth(new Date()),
      toPurchaseDate: endOfMonth(new Date()),
    });
    console.log("totalInvoice :>> ", totalInvoice);
    const PRODUCT_PER_PAGE = 100;

    const pageInvoice = Math.ceil(totalInvoice / PRODUCT_PER_PAGE);
    const rows = await sheet.getRows();
    const rowMap = new Map();
    for (let i = 0; i <= rows.length; i++) {
      if (rows[i]?.id) {
        rowMap.set(rows[i]?.id, { ...rows[i], index: rows[i]._rowNumber });
      }
    }
    const arr = [];
    for (let i = 1; i <= pageInvoice; i++) {
      const invoices = await getInvoice(authHeader, i, {
        fromPurchaseDate: startOfMonth(new Date()),
        toPurchaseDate: endOfMonth(new Date()),
      });
      invoices.map((invoice) => {
        const invoiceRow = rowMap.get(invoice.id);
        if (
          invoiceRow &&
          invoiceRow.modifiedDate &&
          new Date(invoice.modifiedDate).getTime() !==
            invoiceRow.modifiedTimeStamp
        ) {
          const invoiceData = {
            ...invoice,
            ...restPayment,
            paymentStatusValue: statusValue,
            purchaseDate: format(
              new Date(invoice.purchaseDate),
              "dd/MM/yyyy , H:mm:ss"
            ),
            createdTimeStamp: new Date(invoice.createdDate).getTime(),
            modifiedTimeStamp: invoice.modifiedDate
              ? new Date(invoice.createdDate).getTime()
              : "",

            ...invoice.invoiceDelivery,
            partnerDeliveryName: invoice?.invoiceDelivery?.partnerDelivery.name,
            partnerDeliveryEmail:
              invoice?.invoiceDelivery?.partnerDelivery.code,
            createdDate: format(
              new Date(invoice.createdDate),
              "dd/MM/yyyy , H:mm:ss"
            ),
            modifiedDate: invoice.modifiedDate
              ? format(new Date(invoice.modifiedDate), "dd/MM/yyyy , H:mm:ss")
              : "",
          };
          console.log("invoiceRow.index :>> ", invoiceRow.index);
          rows[invoiceRow.index] = invoiceData;
          arr.push(rows[invoiceRow.index].save());
        }
      });
      await Promise.all(arr);
    }
    console.log("arr :>> ", arr);
  } catch (error) {
    console.log("error", error);
  }
  const end = Date.now();
  const duration = end - start;
  console.log(`Call to doSomething took ${duration} milliseconds`);
  process.exit(1);
};

addNewInvoice();
