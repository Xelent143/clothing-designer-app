
import React from 'react';
import { Concept, ProductionAssets, Gender } from '../types';

interface TechPackProps {
  concept: Concept;
  assets: ProductionAssets;
  category: string;
  gender: Gender;
  onClose: () => void;
}

export const TechPack: React.FC<TechPackProps> = ({ concept, assets, category, gender, onClose }) => {
  const date = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  const styleCode = `CP-${category.substring(0, 3).toUpperCase()}-${Math.floor(Math.random() * 10000)}`;

  // --- Dynamic Content Generators ---

  const getFabricDetails = (cat: string) => {
    const c = cat.toLowerCase();
    if (c.includes('american football')) return { name: "Pro-Stretch Performance Mesh", weight: "280gsm", comp: "85% Poly / 15% Spandex" };
    if (c.includes('puffer')) return { name: "Technical Nylon Shell", weight: "80gsm (Shell)", comp: "100% Nylon / 90-10 Down Fill" };
    if (c.includes('hunting')) return { name: "Heavy Waxed Canvas", weight: "12oz", comp: "100% Cotton" };
    if (c.includes('soccer')) return { name: "Performance Jacquard Knit", weight: "160gsm", comp: "100% Polyester" };
    if (c.includes('denim')) return { name: "Raw Denim", weight: "14oz", comp: "100% Cotton" };
    if (c.includes('hoodie')) return { name: "French Terry", weight: "500gsm", comp: "100% Cotton" };
    if (c.includes('tee') || c.includes('t-shirt')) return { name: "Single Jersey", weight: "240gsm", comp: "100% Cotton" };
    if (c.includes('track')) return { name: "Tech Velour", weight: "300gsm", comp: "80% Cotton / 20% Poly" };
    if (c.includes('baseball')) return { name: "Heavy Double-Knit Poly", weight: "250gsm", comp: "100% Polyester" };
    if (c.includes('ice hockey')) return { name: "Air-Knit Mesh", weight: "300gsm", comp: "100% Polyester" };
    if (c.includes('ski jacket')) return { name: "3L Waterproof Shell", weight: "150gsm", comp: "100% Nylon with PU Membrane" };
    return { name: "Premium Streetwear Blend", weight: "Heavyweight", comp: "Mixed Media" };
  };
  const fabric = getFabricDetails(category);

  const getMeasurements = (cat: string) => {
    const c = cat.toLowerCase();
    if (c.includes('t-shirt') || c.includes('top') || c.includes('hoodie') || c.includes('jacket') || c.includes('uniform') || c.includes('american football') || c.includes('jersey')) {
      return [
        { point: 'A. Total Length', s: '68cm', m: '70cm', l: '72cm', xl: '74cm', xxl: '76cm', tol: '+/- 1' },
        { point: 'B. Chest Width', s: '54cm', m: '56cm', l: '58cm', xl: '60cm', xxl: '62cm', tol: '+/- 1' },
        { point: 'C. Shoulder Width', s: '50cm', m: '52cm', l: '54cm', xl: '56cm', xxl: '58cm', tol: '+/- 0.5' },
        { point: 'D. Sleeve Length', s: '22cm', m: '23cm', l: '24cm', xl: '25cm', xxl: '26cm', tol: '+/- 0.5' },
        { point: 'E. Neck Opening', s: '18cm', m: '18.5cm', l: '19cm', xl: '19.5cm', xxl: '20cm', tol: '+/- 0.5' },
      ];
    }
    if (c.includes('trouser') || c.includes('short') || c.includes('tracksuit') || c.includes('legging')) {
      return [
        { point: 'A. Waist (Relaxed)', s: '36cm', m: '38cm', l: '40cm', xl: '42cm', xxl: '44cm', tol: '+/- 1' },
        { point: 'B. Hip Width', s: '52cm', m: '54cm', l: '56cm', xl: '58cm', xxl: '60cm', tol: '+/- 1' },
        { point: 'C. Thigh Width', s: '30cm', m: '31cm', l: '32cm', xl: '33cm', xxl: '34cm', tol: '+/- 0.5' },
        { point: 'D. Inseam', s: '78cm', m: '79cm', l: '80cm', xl: '81cm', xxl: '82cm', tol: '+/- 1' },
        { point: 'E. Leg Opening', s: '20cm', m: '21cm', l: '22cm', xl: '23cm', xxl: '24cm', tol: '+/- 0.5' },
      ];
    }
    return [];
  };
  const measurements = getMeasurements(category);

  // SEO logic truncated for space but kept intact in full app
  let fitType = category.match(/Hoodie|Tracksuit|T-Shirt|Jacket/i) ? 'Oversized / Boxy Fit' : 'Relaxed / Stacked Fit';
  let sizingAdvice = 'True to Size';

  return (
    <div className="bg-white min-h-screen text-black font-sans relative">
      <style>{`
        .tech-pack-content, .tech-pack-content * {
          color: black !important;
        }
        @media print {
          .no-print { display: none !important; }
        }
      `}</style>

      <div className="fixed top-4 right-4 flex gap-4 no-print z-50">
        <button onClick={onClose} className="px-6 py-2 bg-black text-white font-bold uppercase tracking-wider hover:bg-gray-800">Close Preview</button>
        <button onClick={() => window.print()} className="px-6 py-2 bg-purple-600 text-white font-bold uppercase tracking-wider hover:bg-purple-700 shadow-lg">Print / Save PDF</button>
      </div>

      <div className="tech-pack-content max-w-[210mm] mx-auto p-8 bg-white print:p-0 print:max-w-none shadow-2xl print:shadow-none">
        <header className="border-b-4 border-black pb-4 mb-8 flex justify-between items-end">
          <div>
            <h1 className="text-4xl font-bold uppercase tracking-tighter">AZEL<span className="text-gray-500">IFY</span></h1>
            <p className="text-xs font-bold tracking-widest mt-1">PROFESSIONAL SPECIFICATION SHEET</p>
          </div>
          <div className="text-right text-sm">
            <p><span className="font-bold">STYLE CODE:</span> {styleCode}</p>
            <p><span className="font-bold">SEASON:</span> FW25</p>
            <p><span className="font-bold">DATE:</span> {date}</p>
            <p><span className="font-bold">CATEGORY:</span> {gender} {category}</p>
          </div>
        </header>

        <section className="mb-12">
          <div className="border-2 border-black p-1 mb-4">
            <div className="grid grid-cols-2 gap-1 h-[400px]">
              <div className="border border-gray-200 relative p-4 flex flex-col items-center justify-center">
                <span className="absolute top-2 left-2 text-xs font-bold bg-black text-white px-2 py-1">FRONT VIEW</span>
                <img src={`data:image/png;base64,${assets.front}`} alt="Front" className="max-h-full max-w-full object-contain" />
              </div>
              <div className="border border-gray-200 relative p-4 flex flex-col items-center justify-center">
                <span className="absolute top-2 left-2 text-xs font-bold bg-black text-white px-2 py-1">BACK VIEW</span>
                <img src={`data:image/png;base64,${assets.back}`} alt="Back" className="max-h-full max-w-full object-contain" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8">
            <div>
              <h3 className="font-bold uppercase border-b border-black mb-2">Design Description</h3>
              <p className="text-sm leading-relaxed">{concept.description}</p>
            </div>
            <div>
              <h3 className="font-bold uppercase border-b border-black mb-2">Construction Notes</h3>
              <ul className="text-sm space-y-1 list-disc list-inside">
                <li>Double needle stitching on all hems (Gauge 12).</li>
                <li>Reinforced stress points with bar tacks.</li>
                <li>Main label centered on back neck yoke.</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="mb-12">
          <h3 className="text-xl font-bold uppercase mb-4 bg-black text-white p-2">Bill of Materials (BOM)</h3>
          <table className="w-full border-collapse border border-black text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="border border-black p-2 text-left">Item</th>
                <th className="border border-black p-2 text-left">Description / Spec</th>
                <th className="border border-black p-2 text-left">Placement</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-black p-2">Self Fabric</td>
                <td className="border border-black p-2">{fabric.name}, {fabric.weight}</td>
                <td className="border border-black p-2">Main Body</td>
              </tr>
              <tr>
                <td className="border border-black p-2">Ribbing</td>
                <td className="border border-black p-2">2x1 Rib, 95/5 Cotton Poly</td>
                <td className="border border-black p-2">Trims</td>
              </tr>
            </tbody>
          </table>
        </section>

        <section>
          <h3 className="text-xl font-bold uppercase mb-4 bg-black text-white p-2">Graded Measurement Chart (cm)</h3>
          <table className="w-full border-collapse border border-black text-sm text-center">
            <thead className="bg-gray-100">
              <tr>
                <th className="border border-black p-2 text-left">POM</th>
                <th className="border border-black p-2">S</th>
                <th className="border border-black p-2 font-bold bg-gray-50">M</th>
                <th className="border border-black p-2">L</th>
                <th className="border border-black p-2">XL</th>
              </tr>
            </thead>
            <tbody>
              {measurements.map((m, i) => (
                <tr key={i}>
                  <td className="border border-black p-2 text-left font-bold">{m.point}</td>
                  <td className="border border-black p-2">{m.s}</td>
                  <td className="border border-black p-2 font-bold bg-gray-50">{m.m}</td>
                  <td className="border border-black p-2">{m.l}</td>
                  <td className="border border-black p-2">{m.xl}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <footer className="mt-12 pt-4 border-t border-black text-center text-xs text-gray-400 uppercase">
          Generated by Azelify AI • {styleCode} • Confidential Property
        </footer>
      </div>
    </div>
  );
};
