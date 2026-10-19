"use client";

import React, { useState } from "react";
import Navbar from "@/components/navigation/Navbar";
import Footer from "@/components/navigation/Footer";
import { useCart } from "@/hooks/useCart";
import { ExternalLink, Heart, Code } from "lucide-react";

interface LibLicense {
  name: string;
  author: string;
  version: string;
  license: string;
  url: string;
  description: string;
  licenseText: string;
}

const LIBRARIES: LibLicense[] = [
  {
    name: "Next.js",
    author: "Vercel, Inc.",
    version: "16.x",
    license: "MIT License",
    url: "https://github.com/vercel/next.js",
    description: "The React Framework for the Web powering AUREVIA's serverless edge rendering and App Router architecture.",
    licenseText: `The MIT License (MIT)

Copyright (c) 2026 Vercel, Inc.

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.`,
  },
  {
    name: "React & React-DOM",
    author: "Meta Platforms, Inc.",
    version: "19.x",
    license: "MIT License",
    url: "https://github.com/facebook/react",
    description: "Core declarative UI library utilized for building interactive filmmaker tools and real-time equipment catalog filters.",
    licenseText: `MIT License

Copyright (c) Meta Platforms, Inc. and affiliates.

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.`,
  },
  {
    name: "Supabase JS Client",
    author: "Supabase Inc.",
    version: "2.x",
    license: "MIT License",
    url: "https://github.com/supabase/supabase-js",
    description: "PostgreSQL database connector, row-level security enforcement, and encrypted document storage client.",
    licenseText: `MIT License

Copyright (c) 2026 Supabase Inc.

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.`,
  },
  {
    name: "Lucide React",
    author: "Lucide Contributors",
    version: "0.4x",
    license: "ISC License",
    url: "https://lucide.dev",
    description: "Clean, consistent icon set designed for cinema equipment, audio, lighting, and trust indicators.",
    licenseText: `ISC License

Copyright (c) for portions of Lucide are held by Cole Bemis 2013-2022 as part of Feather (MIT). All other copyright (c) 2022-present Lucide Contributors.

Permission to use, copy, modify, and/or distribute this software for any purpose with or without fee is hereby granted, provided that the above copyright notice and this permission notice appear in all copies.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.`,
  },
  {
    name: "Tailwind CSS",
    author: "Tailwind Labs, Inc.",
    version: "4.x",
    license: "MIT License",
    url: "https://tailwindcss.com",
    description: "Utility-first CSS framework enabling our custom obsidian, ivory, and champagne-gold design token system.",
    licenseText: `MIT License

Copyright (c) Tailwind Labs, Inc.

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.`,
  },
  {
    name: "TypeScript",
    author: "Microsoft Corp.",
    version: "5.x",
    license: "Apache License 2.0",
    url: "https://www.typescriptlang.org",
    description: "Strongly typed JavaScript programming language ensuring zero-defect booking calculations and type-safe schema integrity.",
    licenseText: `Apache License
Version 2.0, January 2004
http://www.apache.org/licenses/

TERMS AND CONDITIONS FOR USE, REPRODUCTION, AND DISTRIBUTION

Copyright Microsoft Corporation. All rights reserved.

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.`,
  },
];

export default function LicensesClient() {
  const { cart } = useCart();
  const [selectedLib, setSelectedLib] = useState<LibLicense | null>(null);

  return (
    <div className="min-h-screen bg-obsidian text-ivory pb-20 selection:bg-gold-champagne/20 selection:text-ivory">
      <Navbar cartItemCount={cart.length} />

      {/* Header Banner */}
      <header className="pt-32 pb-14 px-6 md:px-12 max-w-7xl mx-auto border-b border-white/5 relative">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-semibold uppercase tracking-[0.25em] text-gold-champagne font-mono block">
                Open-Source Transparency
              </span>
              <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-mono">
                Licence Attribution
              </span>
            </div>
            <h1 className="serif-heading text-4xl md:text-5xl lg:text-6xl font-light text-ivory">
              Open-Source <span className="text-gold">Licences</span>
            </h1>
            <p className="text-xs text-muted-gray max-w-2xl font-light leading-relaxed">
              AUREVIA is constructed using battle-tested open-source software libraries. We celebrate the open-source engineering community and provide statutory attribution notices below.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs font-mono text-muted-gray shrink-0">
            <Heart size={14} className="text-rose-500 fill-rose-500" />
            <span>Built with Open-Source Excellence</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 md:px-12 py-12 space-y-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {LIBRARIES.map((lib) => (
            <div
              key={lib.name}
              className="p-5 rounded-2xl bg-white/2 border border-white/5 hover:border-gold-champagne/30 transition flex flex-col justify-between space-y-4"
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="serif-heading text-lg font-medium text-ivory">
                      {lib.name}
                    </h3>
                    <p className="text-[11px] text-muted-gray font-mono">
                      by {lib.author} • v{lib.version}
                    </p>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-gold-champagne/10 text-gold-champagne border border-gold-champagne/20">
                    {lib.license}
                  </span>
                </div>
                <p className="text-xs text-muted-gray font-light leading-relaxed">
                  {lib.description}
                </p>
              </div>

              <div className="pt-3 border-t border-white/5 flex items-center justify-between">
                <a
                  href={lib.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[11px] text-muted-gray hover:text-gold-champagne transition"
                >
                  <span>Repository</span>
                  <ExternalLink size={12} />
                </a>

                <button
                  type="button"
                  onClick={() => setSelectedLib(lib)}
                  className="inline-flex items-center gap-1 text-[11px] text-gold-champagne hover:underline"
                >
                  <Code size={12} />
                  <span>View Notice</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* License Text Modal */}
        {selectedLib && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
            <div className="bg-obsidian border border-white/10 rounded-2xl max-w-2xl w-full p-6 space-y-4 shadow-2xl">
              <div className="flex items-center justify-between border-b border-white/5 pb-3">
                <div>
                  <h3 className="serif-heading text-base font-medium text-ivory">
                    {selectedLib.name} Licence Notice
                  </h3>
                  <p className="text-[11px] text-muted-gray font-mono">
                    {selectedLib.license} • {selectedLib.author}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedLib(null)}
                  className="text-xs text-muted-gray hover:text-ivory px-2 py-1 rounded-md bg-white/5"
                >
                  Close (ESC)
                </button>
              </div>

              <pre className="text-[11px] font-mono text-muted-gray bg-white/2 p-4 rounded-xl border border-white/5 max-h-80 overflow-y-auto whitespace-pre-wrap leading-relaxed">
                {selectedLib.licenseText}
              </pre>

              <div className="flex justify-end">
                <button
                  onClick={() => setSelectedLib(null)}
                  className="px-4 py-1.5 rounded-xl bg-gold-champagne text-obsidian text-xs font-semibold"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Note */}
        <section className="p-5 rounded-2xl bg-white/2 border border-white/5 space-y-1.5 text-xs text-muted-gray">
          <h4 className="serif-heading text-sm font-medium text-ivory">
            Software Integrity &amp; Distribution Notice
          </h4>
          <p>
            All third-party trademarks and software packages referenced above remain the property of their respective copyright owners. Their inclusion does not imply endorsement of AUREVIA by Meta, Microsoft, or Vercel.
          </p>
        </section>
      </main>

      <Footer />
    </div>
  );
}
