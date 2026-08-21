export const formatDateDDMMYYYY = (date = new Date()) => {
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
};

export const parseDateDDMMYYYY = (dateStr) => {
  if (!dateStr || typeof dateStr !== "string") {
    return null;
  }
  const [day, month, year] = dateStr.split("-").map(Number);
  if (!day || !month || !year) {
    return null;
  }
  return new Date(year, month - 1, day);
};

export const isSameCalendarDate = (dateStr, selectedDate) => {
  const articleDate = parseDateDDMMYYYY(dateStr);
  if (!articleDate || !selectedDate) {
    return false;
  }
  return (
    articleDate.getDate() === selectedDate.getDate() &&
    articleDate.getMonth() === selectedDate.getMonth() &&
    articleDate.getFullYear() === selectedDate.getFullYear()
  );
};
