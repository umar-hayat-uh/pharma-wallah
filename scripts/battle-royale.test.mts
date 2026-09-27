/**
 * Battle Royale — pure-layer tests (display helpers and request schemas).
 * The game engine itself is SQL and is tested separately against a throwaway
 * Postgres: scripts/battle-royale-engine.test.sql.
 *
 *   node --test scripts/battle-royale.test.mts
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { register } from "node:module";

register("./lib/ts-resolve.mjs", import.meta.url);

const f = await import("../src/lib/battle-royale/format.ts");
const s = await import("../src/lib/battle-royale/schemas.ts");
const st = await import("../src/components/battle-royale/battle/station.ts");

test("shortName keeps the first name and the last initial", () => {
  assert.equal(f.shortName("Ayesha Khan"), "Ayesha K.");
  assert.equal(f.shortName("  syed muhammad   ali "), "syed A.");
  assert.equal(f.shortName("Madonna"), "Madonna");
  assert.equal(f.shortName("   "), "Player");
});

test("formatDuration shows seconds under a minute, m:ss.t above", () => {
  assert.equal(f.formatDuration(48_240), "48.2 s");
  assert.equal(f.formatDuration(83_450), "1:23.5");
  assert.equal(f.formatDuration(0), "0.0 s");
  assert.equal(f.formatDuration(-1), "—");
  assert.equal(f.formatDuration(Number.NaN), "—");
});

test("secondsLeft uses the server clock offset and never goes negative", () => {
  const now = Date.parse("2026-09-27T10:00:00Z");
  const deadline = "2026-09-27T10:00:30Z";
  assert.equal(f.secondsLeft(deadline, 0, now), 30);
  // Station clock 5 s slow: the server is 5 s ahead, so less time is left.
  assert.equal(f.secondsLeft(deadline, 5_000, now), 25);
  assert.equal(f.secondsLeft(deadline, 0, now + 60_000), 0);
  assert.equal(f.secondsLeft("not a date", 0, now), 0);
});

test("formatEventDate and formatTime use Pakistan time", () => {
  assert.equal(f.formatEventDate("2026-10-15"), "Thursday, 15 October 2026");
  assert.equal(f.formatEventDate(null), "To be announced");
  // 05:00 UTC is 10:00 in Karachi (UTC+5, no DST).
  assert.equal(f.formatTime("2026-10-15T05:00:00Z"), "10:00 AM");
});

test("ordinal", () => {
  assert.deepEqual([1, 2, 3, 4, 11, 12, 13, 21, 22, 101, 111].map(f.ordinal),
    ["1st", "2nd", "3rd", "4th", "11th", "12th", "13th", "21st", "22nd", "101st", "111th"]);
});

test("maskEmail and looksLikePlayerId", () => {
  assert.equal(f.maskEmail("ayesha@uok.edu.pk"), "a•••@uok.edu.pk");
  assert.equal(f.maskEmail(null), null);
  assert.ok(f.looksLikePlayerId("br-2026-0007"));
  assert.ok(!f.looksLikePlayerId("BR-26-7"));
});

test("registration schema: trims, lower-cases email, rejects bad input", () => {
  const ok = s.registrationSchema.safeParse({
    name: "  Ayesha Khan ", email: " Ayesha@Example.COM ", phone: "0300-1234567",
    university: "UoK", pharmYear: "Year 3", studentId: "", slotId: "",
  });
  assert.ok(ok.success);
  assert.equal(ok.data.name, "Ayesha Khan");
  assert.equal(ok.data.email, "ayesha@example.com");
  assert.equal(ok.data.studentId, null);
  assert.equal(ok.data.slotId, null);

  for (const bad of [
    { name: "A" },
    { email: "not-an-email" },
    { phone: "abc" },
    { pharmYear: "Year 9" },
    { slotId: "not-a-uuid" },
    { website: "http://spam" },
  ]) {
    const r = s.registrationSchema.safeParse({
      name: "Ayesha", email: "a@b.co", phone: "03001234567", university: "UoK", pharmYear: "Year 1", ...bad,
    });
    assert.ok(!r.success, `should reject ${JSON.stringify(bad)}`);
  }
});

test("code schema: six characters, upper-cased, nothing else in the body", () => {
  const r = s.codeSchema.safeParse({ code: " abc234 " });
  assert.ok(r.success);
  assert.equal(r.data.code, "ABC234");
  assert.ok(!s.codeSchema.safeParse({ code: "ABC" }).success);
  assert.ok(!s.codeSchema.safeParse({ code: "ABC234", playerId: "BR-2026-0001" }).success);
});

test("status schema needs a real Player ID and an email", () => {
  const ok = s.statusSchema.safeParse({ playerId: " br-2026-0007 ", email: " A@B.co " });
  assert.ok(ok.success);
  assert.equal(ok.data.playerId, "BR-2026-0007");
  assert.equal(ok.data.email, "a@b.co");
  assert.ok(!s.statusSchema.safeParse({ playerId: "2026-0007", email: "a@b.co" }).success);
  assert.ok(!s.statusSchema.safeParse({ playerId: "BR-2026-0007", email: "nope" }).success);
});

test("round submissions: only answers, strictly shaped per round", () => {
  const id = "3f1c2d4e-5a6b-4c7d-8e9f-0a1b2c3d4e5f";
  assert.ok(s.submitRoundSchema.safeParse({ round: 1, answers: { found: [{ word: "ASPIRIN", r1: 0, c1: 0, r2: 0, c2: 6 }] } }).success);
  assert.ok(s.submitRoundSchema.safeParse({ round: 2, answers: { boards: [{ questionId: id, matches: ["a", ""] }] } }).success);
  assert.ok(s.submitRoundSchema.safeParse({ round: 3, answers: { choices: [{ questionId: id, choice: null }, { questionId: id, choice: "B" }] } }).success);
  // A client cannot smuggle a score, a time or a participant.
  assert.ok(!s.submitRoundSchema.safeParse({ round: 3, answers: { choices: [] }, score: 999 }).success);
  assert.ok(!s.submitRoundSchema.safeParse({ round: 3, answers: { choices: [], timeMs: 1 } }).success);
  assert.ok(!s.submitRoundSchema.safeParse({ round: 1, answers: { found: [{ word: "X", r1: 0, c1: 0, r2: 0, c2: 1, points: 50 }] } }).success);
  // Round and shape must agree.
  assert.ok(!s.submitRoundSchema.safeParse({ round: 1, answers: { choices: [] } }).success);
  assert.ok(!s.submitRoundSchema.safeParse({ round: 4, answers: {} }).success);
});

test("question schema enforces each round's shape", () => {
  const base = { question: "Clue text", points: 10, timeLimit: 30, difficulty: "easy", active: true };
  assert.ok(s.questionSchema.safeParse({ ...base, type: "WORD", answer: "aspirin" }).success);
  assert.ok(!s.questionSchema.safeParse({ ...base, type: "WORD", answer: "two words" }).success);
  assert.ok(!s.questionSchema.safeParse({ ...base, type: "MCQ", answer: "A", options: { A: "x", B: "y", C: "z", D: "" } }).success);
  const pairs = [{ left: "a", right: "1" }, { left: "b", right: "2" }, { left: "c", right: "3" }];
  assert.ok(s.questionSchema.safeParse({ ...base, type: "MATCHING", pairs }).success);
  // Two identical Column B answers would be indistinguishable to the grader.
  assert.ok(!s.questionSchema.safeParse({ ...base, type: "MATCHING", pairs: [...pairs.slice(0, 2), { left: "c", right: "2" }] }).success);
  assert.ok(!s.questionSchema.safeParse({ ...base, type: "MATCHING", pairs: pairs.slice(0, 2) }).success);
});

test("session schema requires the end after the start", () => {
  const ok = { name: "S1", eventDate: "2026-10-15", startTime: "2026-10-15T10:00:00+05:00", endTime: "2026-10-15T12:00:00+05:00", capacity: "40", status: "open" };
  assert.ok(s.sessionSchema.safeParse(ok).success);
  assert.ok(!s.sessionSchema.safeParse({ ...ok, endTime: "2026-10-15T09:00:00+05:00" }).success);
});

test("schemas accept their own output (the form POSTs transformed values)", () => {
  // Regression: the form sent studentId: null (the transform of ""), and the
  // server's schema — the same one — rejected null, failing every registration
  // that left an optional field blank.
  const reg = s.registrationSchema.parse({
    name: "Sana Iqbal", email: "sana@example.com", phone: "0321-7654321", university: "ZU", pharmYear: "Year 2", studentId: "", slotId: "",
  });
  assert.ok(s.registrationSchema.safeParse(reg).success, "registration round-trips");
  const desk = s.deskRegistrationSchema.parse({ name: "Walk In", email: "", phone: "", university: "Dow", pharmYear: "Year 1", studentId: "", slotId: "" });
  assert.ok(s.deskRegistrationSchema.safeParse(desk).success, "desk registration round-trips");
  const q = s.questionSchema.parse({ type: "WORD", question: "Clue", answer: "aspirin", explanation: "", points: 10, timeLimit: 30, difficulty: "easy", active: true });
  assert.ok(s.questionSchema.safeParse({ ...q, answer: "ASPIRIN" }).success, "question round-trips");
  const st = s.statusSchema.parse({ playerId: "br-2026-0001", email: "A@b.co" });
  assert.ok(s.statusSchema.safeParse(st).success, "status round-trips");
  const desk2 = s.deskRegistrationSchema.parse({ name: "Walk In", university: "Dow", pharmYear: "Year 1" });
  assert.equal(desk2.approve, true, "desk registration approves by default");
});

test("station: straight lines only, in any of 8 directions", () => {
  assert.deepEqual(st.lineCells(0, 0, 0, 3), [[0, 0], [0, 1], [0, 2], [0, 3]]);
  assert.deepEqual(st.lineCells(3, 3, 1, 1), [[3, 3], [2, 2], [1, 1]]);
  assert.deepEqual(st.lineCells(2, 0, 0, 2), [[2, 0], [1, 1], [0, 2]]);
  assert.equal(st.lineCells(0, 0, 1, 2), null, "a knight's move is not a line");
});

test("station: a drag snaps to the nearest direction and stays in the grid", () => {
  assert.deepEqual(st.snapLine(5, 5, 5, 9, 10), [5, 9], "straight right");
  assert.deepEqual(st.snapLine(5, 5, 6, 9, 10), [5, 9], "slightly off horizontal snaps to horizontal");
  assert.deepEqual(st.snapLine(5, 5, 9, 8, 10), [9, 9], "near-diagonal snaps to the diagonal, clamped");
  assert.deepEqual(st.snapLine(0, 0, -3, -3, 10), [0, 0], "off the grid collapses to the anchor");
});

test("station: spelling a line, and the timer never goes negative", () => {
  const grid = ["ASPIRIN", "XXXXXXX", "NIRIPSA"];
  assert.equal(st.spell(grid, st.lineCells(0, 0, 0, 6)), "ASPIRIN");
  assert.equal(st.spell(grid, st.lineCells(2, 6, 2, 0)), "ASPIRIN", "read backwards along the reversed row");
  assert.equal(st.remaining(1000, 30, 1000 + 12_400), 18);
  assert.equal(st.remaining(1000, 30, 1000 + 99_000), 0);
  assert.equal(st.remaining(null, 30), 30, "not started yet");
});

test("station: a resumed battle starts at the first round the server doesn't have", () => {
  const base = { status: "active", results: {} };
  assert.equal(st.freshProgress(base).round, 1);
  assert.equal(st.freshProgress({ ...base, results: { 1: {} } }).round, 2);
  assert.equal(st.freshProgress({ ...base, results: { 1: {}, 2: {} } }).round, 3);
  assert.equal(st.freshProgress({ status: "completed", results: { 1: {}, 2: {}, 3: {} } }).step, "finished");
});
