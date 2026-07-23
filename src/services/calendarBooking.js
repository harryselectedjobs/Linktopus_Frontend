import api from "./api";

export async function checkBookingAvailability(email) {
  const { data } = await api.get("/calendar/check-booking-availability", {
    params: { email },
  });
  return data;
}

export async function bookMeeting({ date, startTime, email, title }) {
  const { data } = await api.post("/calendar/book-meeting", {
    date,
    start_time: startTime,
    email,
    title,
  });
  return data;
}
