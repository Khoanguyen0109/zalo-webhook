const axios = require("axios").default;
const qs = require("qs");
require("dotenv").config();
const {
  format,
  startOfDay,
  endOfDay,
} = require("date-fns");
const { getDoc, authConfig, sleep } = require("./utils");
const { getInvoice, getTotalInvoice } = require("./api");

const addNewInvoice = async () => {
  console.log("Add new Invoice");
  const start = Date.now();
  try {
    const data = await axios.get(
      "https://script.google.com/macros/s/AKfycbzwIkiHFVQ4IPoO-ufXwrxm4bVNgblTy4RViHXq1shvOtQfF6P-5va1cTyNySdcaOWs/exec"
    );
    const { id_sheet_1, id_sheet_2, id_sheet_3, client_email, private_key } =
      data.data.data[0];
    const [doc, doc3, auth] = await Promise.all([
      getDoc(id_sheet_2, client_email, private_key),
      getDoc(id_sheet_3, client_email, private_key),
      axios(authConfig),
    ]);

    const accessToken = auth.data.access_token;
    const authHeader = {
      headers: {
        Authorization: "Bearer " + accessToken, //the token is a variable which holds the token
        Retailer: "denio",
      },
    };
    sleep(1000);
    const storage = [];
    const storageDetail = [];

    const sheet = doc.sheetsByIndex[0];
    const sheetDetail = doc3.sheetsByIndex[0];

    const totalInvoice = await getTotalInvoice(authHeader, {
      fromPurchaseDate: startOfDay(new Date()),
      toPurchaseDate: endOfDay(new Date()),
    });
    const PRODUCT_PER_PAGE = 100;

    const pageInvoice = Math.ceil(totalInvoice / PRODUCT_PER_PAGE);

    const rows = await sheet.getRows();
    const newestInvoiceFromSheet = await sheet.getRows({
      offset: rows.length - 1,
      limit: 1,
    });
    if (rows.length === totalInvoice) {
      return;
    }
    for (let i = 1; i <= pageInvoice; i++) {
      const invoices = await getInvoice(authHeader, i, {
        fromPurchaseDate: startOfDay(new Date()),
        toPurchaseDate: endOfDay(new Date()),
      });
      console.log("invoices :>> ", invoices);
      invoices.map((invoice) => {
        if (
          new Date(invoice.createdDate).getTime() >=
            newestInvoiceFromSheet[0].createdTimeStamp &&
          invoice.id.toString() !== newestInvoiceFromSheet[0].id
        ) {
          const { statusValue, ...restPayment } = invoice?.payment?.[0] ?? {};
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
          invoice.invoiceDetails.map((detail) => {
            const dataDetail = {
              idInvoice: invoice.id,
              ...detail,
              // productBatchExpireId: detail.productBatchExpire?.id,
              // productBatchExpireName: detail.productBatchExpire?.batchName,
              // productBatchExpireCreatedDate: format(
              //   new Date(detail?.productBatchExpire?.createdDate),
              //   'dd/MM/yyyy , H:mm:ss'
              // ),
              // productBatchExpireDate: format(
              //   new Date(detail?.productBatchExpire?.expireDate),
              //   'dd/MM/yyyy , H:mm:ss'
              // ),
              createdDate: format(
                new Date(invoice.createdDate),
                "dd/MM/yyyy , H:mm:ss"
              ),
              modifiedDate: invoice.modifiedDate
                ? format(new Date(invoice.modifiedDate), "dd/MM/yyyy , H:mm:ss")
                : "",
            };
            storageDetail.push(dataDetail);
          });
          storage.push(invoiceData);
        }
      });
    }
    if (storage.length > 0) {
      await Promise.all([
        sheet.addRows(storage),
        sheetDetail.addRows(storageDetail),
      ]);
    }
    const end = Date.now();
    const duration = end - start;
    console.log(`Call to doSomething took ${duration} milliseconds`);
  } catch (error) {
    console.log("error", error);
  }
  process.exit(1);
};

addNewInvoice();
