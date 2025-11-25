import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";
import { Analytics } from "../models/Analytics.js";

dayjs.extend(utc);

const dayKey = () => dayjs().utc().format("YYYY-MM-DD");

const ensureDoc = async () => {
  const key = dayKey();
  let doc = await Analytics.findOne({ date: key });
  if (!doc) {
    const previous = await Analytics.findOne().sort({ date: -1 }).lean();
    doc = await Analytics.create({
      date: key,
      totalUsers: previous?.totalUsers || 0,
      totalLogins: previous?.totalLogins || 0,
      dailyNewUsers: 0,
      dailyLogins: 0
    });
  }
  return doc;
};

export const recordNewUser = async () => {
  const doc = await ensureDoc();
  doc.dailyNewUsers += 1;
  doc.totalUsers += 1;
  await doc.save();
};

export const recordLogin = async () => {
  const doc = await ensureDoc();
  doc.dailyLogins += 1;
  doc.totalLogins += 1;
  await doc.save();
};

export const fetchAnalytics = async () =>
  Analytics.find().sort({ date: -1 }).lean();

