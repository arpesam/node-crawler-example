import { GoogleSpreadsheet } from "google-spreadsheet";
import credenciais from "../google_key.json";

const getDoc = async () => {
  const doc = new GoogleSpreadsheet(
    "1idyv0l7uzMVTXSLhCRfgXDoD-Ul5yEkC4YGRfvNtIJg"
  );

  await doc.useServiceAccountAuth({
    client_email: credenciais.client_email,
    private_key: credenciais.private_key.replace(/\\n/g, "\n"),
  });
  await doc.loadInfo();
  return doc;
};

export default getDoc;
