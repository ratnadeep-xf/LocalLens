const ARTICLE_DATE_RE = /^\d{2}-\d{2}-\d{4}$/;

const calendarDate = (date = new Date(), timeZone = process.env.ARTICLE_TZ) => {
  const formatter = new Intl.DateTimeFormat("en-GB", {
    timeZone: timeZone || "UTC",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
  const parts = formatter.formatToParts(date);
  const get = (type) => parts.find((part) => part.type === type)?.value;
  return `${get("day")}-${get("month")}-${get("year")}`;
};

const toArticleDate = (value) => {
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (ARTICLE_DATE_RE.test(trimmed)) {
      return trimmed;
    }
  }
  return calendarDate();
};

module.exports = {
  ARTICLE_DATE_RE,
  calendarDate,
  toArticleDate,
};
