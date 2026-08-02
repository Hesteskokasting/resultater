import { textLine, RECEIPT_COLS } from "@/utils/receipt/escpos";

const LF = 0x0a;

/** Decode the printable part of a textLine() result (drops the trailing LF). */
function decode(bytes: Uint8Array): string {
  return String.fromCharCode(...Array.from(bytes.slice(0, -1)));
}

describe("textLine", () => {
  it("appends a trailing LF", () => {
    const out = textLine("Hi");
    expect(out[out.length - 1]).toBe(LF);
  });

  it("transliterates Norwegian vowels to ASCII", () => {
    expect(decode(textLine("Bjørn Åse Æ"))).toBe("Bjoern Aase Ae");
  });

  it("strips control bytes so user text cannot inject ESC/POS commands", () => {
    // 0x1B = ESC, 0x1D = GS — would reprogram the printer if passed through.
    const out = textLine("A\x1B\x1DB");
    expect(decode(out)).toBe("A  B");
    expect(Array.from(out)).not.toContain(0x1b);
    expect(Array.from(out)).not.toContain(0x1d);
  });

  it("truncates to RECEIPT_COLS before the LF", () => {
    const out = textLine("x".repeat(RECEIPT_COLS + 10));
    expect(out.length).toBe(RECEIPT_COLS + 1);
  });
});
