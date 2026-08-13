import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { query } = await req.json();

    if (!query || typeof query !== "string") {
      return NextResponse.json(
        { error: "Query parameters must be a valid text string." },
        { status: 400 }
      );
    }

    const lowerQuery = query.toLowerCase();

    // Intelligent match rules based on photography / cinematography domain logic
    let replyText = "";
    let recommendedGear: Array<{ name: string; category: string; pricePerDay: number; reason: string }> = [];

    if (lowerQuery.includes("night") || lowerQuery.includes("low light") || lowerQuery.includes("dark")) {
      replyText = "For low-light shooting and night productions, we recommend pair-matching high-ISO full-frame sensors with ultra-fast f/1.2 or f/1.4 prime lenses to maximize light intake without noise.";
      recommendedGear = [
        { name: "Canon EOS R5 Mirrorless Body", category: "Cameras", pricePerDay: 3500, reason: "45MP Dual Pixel CMOS II with outstanding IBIS and dynamic range." },
        { name: "Canon RF 50mm f/1.2L USM", category: "Lenses", pricePerDay: 2800, reason: "Ultra-wide f/1.2 aperture for maximum light gathering and smooth bokeh." },
        { name: "Aputure LS C300d II Light Kit", category: "Lighting", pricePerDay: 2800, reason: "High-CRI COB daylight key light for subject separation in dark environments." }
      ];
    } else if (lowerQuery.includes("wedding") || lowerQuery.includes("event") || lowerQuery.includes("portrait")) {
      replyText = "For wedding and event cinematography, dual-body redundancy with versatile zoom coverage (24-70mm + 70-200mm) ensures you never miss emotional moments.";
      recommendedGear = [
        { name: "Canon EOS R5 (Dual Body Kit)", category: "Cameras", pricePerDay: 7000, reason: "Primary and B-cam sync for instant switching." },
        { name: "Canon RF 24-70mm f/2.8L IS USM", category: "Lenses", pricePerDay: 3000, reason: "All-rounder lens for pre-wedding rituals and reception." },
        { name: "DJI RS 3 Pro Gimbal Stabilizer", category: "Gimbals", pricePerDay: 1000, reason: "3-axis motorized stabilization for smooth walking shots." }
      ];
    } else if (lowerQuery.includes("documentary") || lowerQuery.includes("interview") || lowerQuery.includes("audio")) {
      replyText = "Documentary setups prioritize high-bitrate internal recording (8K/4K RAW), wireless directional microphones, and reliable field power.";
      recommendedGear = [
        { name: "Canon EOS R5 C Cinema Camera", category: "Cameras", pricePerDay: 6500, reason: "Active cooling fan for unlimited 8K/60p recording without overheating." },
        { name: "Sennheiser MKH-416 Shotgun Mic", category: "Audio", pricePerDay: 1200, reason: "Industry-standard interference-tube microphone for crisp dialogue." },
        { name: "Rode Wireless GO II Dual Kit", category: "Audio", pricePerDay: 1500, reason: "Dual transmitter setup with internal backup recording." }
      ];
    } else {
      replyText = `Based on your request "${query}", our camera concierges recommend a balanced commercial kit featuring top-tier Canon RF optics and active stabilization.`;
      recommendedGear = [
        { name: "Canon EOS R5 Mirrorless Body", category: "Cameras", pricePerDay: 3500, reason: "Flagship hybrid body for 8K video & 45MP stills." },
        { name: "Canon RF 24-70mm f/2.8L IS USM", category: "Lenses", pricePerDay: 3000, reason: "Essential zoom lens covering key focal lengths." },
        { name: "Atomos Ninja V+ 8K Monitor", category: "Accessories", pricePerDay: 1800, reason: "ProRes RAW external recording & high-bright daylight display." }
      ];
    }

    return NextResponse.json({
      success: true,
      answer: replyText,
      recommendations: recommendedGear
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: "AI Concierge processing error", details: error.message },
      { status: 500 }
    );
  }
}
