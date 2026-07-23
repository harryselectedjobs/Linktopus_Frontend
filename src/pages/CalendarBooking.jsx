import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mail,
  CalendarClock,
  CheckCircle2,
  XCircle,
  Loader2,
  ArrowLeft,
} from "lucide-react";
import LogoMark from "../components/layout/Logo";
import NetworkBackdrop from "../components/layout/NetworkBackdrop";
import {
  checkBookingAvailability,
  bookMeeting,
} from "../services/calendarBooking";

const todayStr = new Date().toISOString().slice(0, 10);

export default function CalendarBooking() {
  const [email, setEmail] = useState("");
  const [checking, setChecking] = useState(false);
  const [checkError, setCheckError] = useState("");
  const [availability, setAvailability] = useState(null);

  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [booking, setBooking] = useState(false);
  const [bookError, setBookError] = useState("");
  const [booked, setBooked] = useState(null);

  async function handleCheckAvailability(e) {
    e.preventDefault();
    if (!email.trim() || checking) return;
    setChecking(true);
    setCheckError("");
    setAvailability(null);
    try {
      const data = await checkBookingAvailability(email.trim());
      setAvailability(data);
    } catch (err) {
      setCheckError(
        err.response?.data?.detail ||
          err.response?.data?.message ||
          "Couldn't check availability. Please try again."
      );
    } finally {
      setChecking(false);
    }
  }

  async function handleBookMeeting(e) {
    e.preventDefault();
    if (!date || !startTime || booking) return;
    setBooking(true);
    setBookError("");
    try {
      const data = await bookMeeting({
        date,
        startTime,
        email: email.trim(),
        title: availability?.title || "Meeting",
      });
      setBooked(data);
    } catch (err) {
      setBookError(
        err.response?.data?.detail ||
          err.response?.data?.message ||
          "Couldn't book this meeting. Please try again."
      );
    } finally {
      setBooking(false);
    }
  }

  function handleReset() {
    setEmail("");
    setCheckError("");
    setAvailability(null);
    setDate("");
    setStartTime("");
    setBookError("");
    setBooked(null);
  }

  function handleTryAnotherEmail() {
    setAvailability(null);
    setCheckError("");
  }

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-surface px-4 py-12">
      <NetworkBackdrop className="opacity-90" />

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="relative w-full max-w-md"
      >
        <div className="overflow-hidden rounded-3xl border border-surface-border bg-white shadow-card-hover">
          <div className="h-1.5 w-full bg-gradient-to-r from-primary-700 via-primary to-primary-300" />

          <div className="px-8 pb-8 pt-9 sm:px-10">
            <div className="mb-7 flex flex-col items-center text-center">
              <div className="mb-4 flex items-center gap-2.5">
                <LogoMark size={32} />
                <span className="font-display text-xl font-bold text-ink">
                  Linktopus
                </span>
              </div>
              <h1 className="font-display text-2xl font-bold text-ink">
                Book a Meeting
              </h1>
              <p className="mt-1.5 text-sm text-slate">
                Enter your email to check availability and schedule time.
              </p>
            </div>

            <AnimatePresence mode="wait">
              {!availability && !booked && (
                <motion.form
                  key="email-form"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onSubmit={handleCheckAvailability}
                  className="space-y-4"
                >
                  <div>
                    <label htmlFor="email" className="field-label">
                      Email
                    </label>
                    <div className="relative">
                      <Mail
                        size={16}
                        className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-light"
                      />
                      <input
                        id="email"
                        type="email"
                        required
                        autoComplete="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@company.com"
                        className="input-field pl-10"
                      />
                    </div>
                  </div>

                  {checkError && (
                    <div className="flex items-start gap-2 rounded-xl bg-spark/10 px-3.5 py-2.5 text-sm text-[#B8402A]">
                      <XCircle size={16} className="mt-0.5 shrink-0" />
                      <span>{checkError}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={!email.trim() || checking}
                    className="btn-primary w-full"
                  >
                    {checking && (
                      <Loader2 size={15} className="animate-spin" />
                    )}
                    {checking ? "Checking…" : "Check Availability"}
                  </button>
                </motion.form>
              )}

              {availability && !availability.booking_available && !booked && (
                <motion.div
                  key="unavailable"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-5"
                >
                  <div className="flex items-start gap-2.5 rounded-xl bg-spark/10 px-4 py-3.5 text-sm text-[#B8402A]">
                    <XCircle size={18} className="mt-0.5 shrink-0" />
                    <div>
                      <p className="font-display font-semibold">
                        Booking not available
                      </p>
                      <p className="mt-0.5">{availability.reason}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleTryAnotherEmail}
                    className="btn-secondary w-full"
                  >
                    <ArrowLeft size={15} />
                    Try another email
                  </button>
                </motion.div>
              )}

              {availability && availability.booking_available && !booked && (
                <motion.form
                  key="booking-form"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onSubmit={handleBookMeeting}
                  className="space-y-4"
                >
                  <div className="flex items-start gap-2.5 rounded-xl bg-primary-50 px-4 py-3.5 text-sm text-primary-700">
                    <CheckCircle2 size={18} className="mt-0.5 shrink-0" />
                    <div>
                      <p className="font-display font-semibold text-ink">
                        {availability.title || "Booking available"}
                      </p>
                      <p className="mt-0.5">{availability.reason}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label htmlFor="date" className="field-label">
                        Date
                      </label>
                      <input
                        id="date"
                        type="date"
                        required
                        min={todayStr}
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className="input-field"
                      />
                    </div>
                    <div>
                      <label htmlFor="start-time" className="field-label">
                        Start time
                      </label>
                      <input
                        id="start-time"
                        type="time"
                        required
                        value={startTime}
                        onChange={(e) => setStartTime(e.target.value)}
                        className="input-field"
                      />
                    </div>
                  </div>

                  {bookError && (
                    <div className="flex items-start gap-2 rounded-xl bg-spark/10 px-3.5 py-2.5 text-sm text-[#B8402A]">
                      <XCircle size={16} className="mt-0.5 shrink-0" />
                      <span>{bookError}</span>
                    </div>
                  )}

                  <div className="flex gap-2.5">
                    <button
                      type="button"
                      onClick={handleTryAnotherEmail}
                      className="btn-secondary !px-4"
                    >
                      <ArrowLeft size={15} />
                    </button>
                    <button
                      type="submit"
                      disabled={!date || !startTime || booking}
                      className="btn-primary flex-1"
                    >
                      {booking ? (
                        <Loader2 size={15} className="animate-spin" />
                      ) : (
                        <CalendarClock size={15} />
                      )}
                      {booking ? "Booking…" : "Book Meeting"}
                    </button>
                  </div>
                </motion.form>
              )}

              {booked && (
                <motion.div
                  key="confirmed"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-5 text-center"
                >
                  <div className="flex flex-col items-center gap-3 rounded-xl bg-primary-50 px-4 py-6">
                    <CheckCircle2 size={32} className="text-primary" />
                    <div>
                      <p className="font-display text-base font-semibold text-ink">
                        Meeting booked!
                      </p>
                      <p className="mt-1 text-sm text-slate">
                        {new Date(`${date}T00:00:00`).toLocaleDateString(
                          undefined,
                          { month: "short", day: "numeric", year: "numeric" }
                        )}{" "}
                        at {startTime}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleReset}
                    className="btn-secondary w-full"
                  >
                    Book another meeting
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
