/* =====================================================
   Sectional Chart Quiz - Part 107 Exam Guide
   ES5 style: var + function () {}
   ===================================================== */

/* -----------------------------------------------------
   SVG Chart Builder Helpers
   ----------------------------------------------------- */

/* A simple grey grid + outline used as a backdrop for
   every chart snippet so the scene feels chart-like. */
function svgBackdrop() {
    var html = '';
    // Outer chart border
    html += '<rect x="0" y="0" width="300" height="300" fill="#fbfaf6" stroke="#d6d3ca" stroke-width="1"/>';
    // Latitude/longitude grid (very faint)
    html += '<g stroke="#ebe7dc" stroke-width="0.5">';
    html += '<line x1="0" y1="60"  x2="300" y2="60"/>';
    html += '<line x1="0" y1="120" x2="300" y2="120"/>';
    html += '<line x1="0" y1="180" x2="300" y2="180"/>';
    html += '<line x1="0" y1="240" x2="300" y2="240"/>';
    html += '<line x1="60"  y1="0" x2="60"  y2="300"/>';
    html += '<line x1="120" y1="0" x2="120" y2="300"/>';
    html += '<line x1="180" y1="0" x2="180" y2="300"/>';
    html += '<line x1="240" y1="0" x2="240" y2="300"/>';
    html += '</g>';
    // North arrow
    html += '<g transform="translate(20,28)">';
    html += '<line x1="0" y1="14" x2="0" y2="-12" stroke="#9a958a" stroke-width="1.2"/>';
    html += '<polygon points="0,-14 -4,-6 4,-6" fill="#9a958a"/>';
    html += '<text x="0" y="26" text-anchor="middle" font-family="Arial,sans-serif" font-size="9" fill="#9a958a">N</text>';
    html += '</g>';
    return html;
}

function svgWrap(inner) {
    return '<svg viewBox="0 0 300 300" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Sectional chart snippet" style="width:100%;height:auto;max-width:380px;display:block;margin:0 auto;background:#fbfaf6;border-radius:8px;">'
        + svgBackdrop()
        + inner
        + '</svg>';
}

/* A drone pilot location marker — small red X with label */
function pilotMarker(x, y, label) {
    var g = '';
    g += '<g>';
    g += '<line x1="' + (x - 6) + '" y1="' + (y - 6) + '" x2="' + (x + 6) + '" y2="' + (y + 6) + '" stroke="#d93025" stroke-width="2.5" stroke-linecap="round"/>';
    g += '<line x1="' + (x + 6) + '" y1="' + (y - 6) + '" x2="' + (x - 6) + '" y2="' + (y + 6) + '" stroke="#d93025" stroke-width="2.5" stroke-linecap="round"/>';
    if (label) {
        g += '<text x="' + (x + 10) + '" y="' + (y + 4) + '" font-family="Arial,sans-serif" font-size="10" font-weight="700" fill="#d93025">' + label + '</text>';
    }
    g += '</g>';
    return g;
}

/* Blue (towered) airport symbol — solid wheel-and-spokes */
function airportTowered(x, y, code) {
    var g = '';
    g += '<g>';
    g += '<circle cx="' + x + '" cy="' + y + '" r="9" fill="#1a4ea3" stroke="#1a4ea3" stroke-width="1"/>';
    g += '<line x1="' + (x - 12) + '" y1="' + y + '" x2="' + (x + 12) + '" y2="' + y + '" stroke="#1a4ea3" stroke-width="2"/>';
    g += '<line x1="' + x + '" y1="' + (y - 12) + '" x2="' + x + '" y2="' + (y + 12) + '" stroke="#1a4ea3" stroke-width="2"/>';
    if (code) {
        g += '<text x="' + (x + 14) + '" y="' + (y + 22) + '" font-family="Arial,sans-serif" font-size="10" font-weight="700" fill="#1a4ea3">' + code + '</text>';
    }
    g += '</g>';
    return g;
}

/* Magenta (non-towered) airport symbol */
function airportNonTowered(x, y, code) {
    var g = '';
    g += '<g>';
    g += '<circle cx="' + x + '" cy="' + y + '" r="9" fill="#b3257a" stroke="#b3257a" stroke-width="1"/>';
    g += '<line x1="' + (x - 12) + '" y1="' + y + '" x2="' + (x + 12) + '" y2="' + y + '" stroke="#b3257a" stroke-width="2"/>';
    g += '<line x1="' + x + '" y1="' + (y - 12) + '" x2="' + x + '" y2="' + (y + 12) + '" stroke="#b3257a" stroke-width="2"/>';
    if (code) {
        g += '<text x="' + (x + 14) + '" y="' + (y + 22) + '" font-family="Arial,sans-serif" font-size="10" font-weight="700" fill="#b3257a">' + code + '</text>';
    }
    g += '</g>';
    return g;
}

/* -----------------------------------------------------
   Individual Chart Snippets (SVG inner markup)
   ----------------------------------------------------- */

/* 1. Class B — solid blue concentric circles, altitude label "100/SFC" */
function chartClassB() {
    var inner = '';
    // Outer Class B shelf
    inner += '<circle cx="150" cy="150" r="120" fill="none" stroke="#0b3d91" stroke-width="2.5"/>';
    // Inner Class B core
    inner += '<circle cx="150" cy="150" r="70" fill="none" stroke="#0b3d91" stroke-width="2.5"/>';
    // Altitude labels
    inner += '<text x="150" y="40" text-anchor="middle" font-family="Arial,sans-serif" font-size="11" font-weight="700" fill="#0b3d91">100</text>';
    inner += '<line x1="138" y1="44" x2="162" y2="44" stroke="#0b3d91" stroke-width="1"/>';
    inner += '<text x="150" y="56" text-anchor="middle" font-family="Arial,sans-serif" font-size="11" font-weight="700" fill="#0b3d91">SFC</text>';
    // Airport
    inner += airportTowered(150, 150, 'KBIG');
    // Drone marker inside the core
    inner += pilotMarker(180, 180, 'You');
    return svgWrap(inner);
}

/* 2. Class C — solid magenta concentric circles */
function chartClassC() {
    var inner = '';
    inner += '<circle cx="150" cy="150" r="110" fill="none" stroke="#b3257a" stroke-width="2.5"/>';
    inner += '<circle cx="150" cy="150" r="60" fill="none" stroke="#b3257a" stroke-width="2.5"/>';
    // Altitude label "41/SFC"
    inner += '<text x="150" y="42" text-anchor="middle" font-family="Arial,sans-serif" font-size="11" font-weight="700" fill="#b3257a">41</text>';
    inner += '<line x1="140" y1="46" x2="160" y2="46" stroke="#b3257a" stroke-width="1"/>';
    inner += '<text x="150" y="58" text-anchor="middle" font-family="Arial,sans-serif" font-size="11" font-weight="700" fill="#b3257a">SFC</text>';
    inner += airportTowered(150, 150, 'KMID');
    inner += pilotMarker(100, 130, 'You');
    return svgWrap(inner);
}

/* 3. Class D — dashed blue circle with ceiling box */
function chartClassD() {
    var inner = '';
    inner += '<circle cx="150" cy="150" r="100" fill="none" stroke="#0b3d91" stroke-width="2.5" stroke-dasharray="6 5"/>';
    // Ceiling box "[25]"
    inner += '<rect x="232" y="60" width="40" height="22" fill="none" stroke="#0b3d91" stroke-width="1.5" stroke-dasharray="4 3"/>';
    inner += '<text x="252" y="76" text-anchor="middle" font-family="Arial,sans-serif" font-size="13" font-weight="700" fill="#0b3d91">25</text>';
    inner += airportTowered(150, 150, 'KDEL');
    inner += pilotMarker(190, 170, 'You');
    return svgWrap(inner);
}

/* 4. Class E surface area — dashed magenta circle around non-towered airport */
function chartClassESurface() {
    var inner = '';
    inner += '<circle cx="150" cy="150" r="95" fill="none" stroke="#b3257a" stroke-width="2.5" stroke-dasharray="6 5"/>';
    inner += airportNonTowered(150, 150, 'KECO');
    inner += pilotMarker(120, 110, 'You');
    return svgWrap(inner);
}

/* 5. Class E starting at 700 ft AGL — faded magenta vignette */
function chartClassE700() {
    var inner = '';
    // Soft magenta band along an irregular boundary (left side faded)
    inner += '<defs>';
    inner += '<linearGradient id="mag700" x1="0" y1="0" x2="1" y2="0">';
    inner += '<stop offset="0%" stop-color="#e57bb0" stop-opacity="0.55"/>';
    inner += '<stop offset="100%" stop-color="#e57bb0" stop-opacity="0"/>';
    inner += '</linearGradient>';
    inner += '</defs>';
    // The vignette band
    inner += '<path d="M40,40 Q90,140 60,260 L0,260 L0,40 Z" fill="url(#mag700)"/>';
    // Boundary line (where the shading transitions)
    inner += '<path d="M40,40 Q90,140 60,260" fill="none" stroke="#b3257a" stroke-width="1.5" opacity="0.7"/>';
    inner += '<text x="80" y="30" font-family="Arial,sans-serif" font-size="9" fill="#7a4060" font-style="italic">Class E floor 700 AGL on this side</text>';
    // Small town/airport
    inner += airportNonTowered(180, 170, 'KRUR');
    inner += pilotMarker(150, 230, 'You');
    return svgWrap(inner);
}

/* 6. Class E starting at 1200 ft AGL — faded blue vignette */
function chartClassE1200() {
    var inner = '';
    inner += '<defs>';
    inner += '<linearGradient id="blu1200" x1="1" y1="0" x2="0" y2="0">';
    inner += '<stop offset="0%" stop-color="#7aa8dd" stop-opacity="0.55"/>';
    inner += '<stop offset="100%" stop-color="#7aa8dd" stop-opacity="0"/>';
    inner += '</linearGradient>';
    inner += '</defs>';
    inner += '<path d="M260,40 Q210,140 240,260 L300,260 L300,40 Z" fill="url(#blu1200)"/>';
    inner += '<path d="M260,40 Q210,140 240,260" fill="none" stroke="#0b3d91" stroke-width="1.5" opacity="0.7"/>';
    inner += '<text x="155" y="30" font-family="Arial,sans-serif" font-size="9" fill="#1a4ea3" font-style="italic">Class E floor 1200 AGL on this side</text>';
    inner += pilotMarker(120, 180, 'You');
    return svgWrap(inner);
}

/* 7. MOA — magenta hashed boundary */
function chartMOA() {
    var inner = '';
    inner += '<defs>';
    inner += '<pattern id="moaHash" patternUnits="userSpaceOnUse" width="8" height="8" patternTransform="rotate(45)">';
    inner += '<line x1="0" y1="0" x2="0" y2="8" stroke="#b3257a" stroke-width="1.2"/>';
    inner += '</pattern>';
    inner += '</defs>';
    // MOA polygon
    inner += '<polygon points="60,80 240,70 250,210 90,230" fill="none" stroke="#b3257a" stroke-width="2"/>';
    // Hash band along inner edge
    inner += '<polygon points="60,80 240,70 250,210 90,230 100,215 240,80 75,90" fill="url(#moaHash)" opacity="0.65"/>';
    inner += '<text x="150" y="150" text-anchor="middle" font-family="Arial,sans-serif" font-size="11" font-weight="700" fill="#7a4060">BIG SKY MOA</text>';
    inner += pilotMarker(150, 175, 'You');
    return svgWrap(inner);
}

/* 8. Restricted Area — blue hashed boundary with R-#### label */
function chartRestricted() {
    var inner = '';
    inner += '<defs>';
    inner += '<pattern id="resHash" patternUnits="userSpaceOnUse" width="8" height="8" patternTransform="rotate(45)">';
    inner += '<line x1="0" y1="0" x2="0" y2="8" stroke="#0b3d91" stroke-width="1.2"/>';
    inner += '</pattern>';
    inner += '</defs>';
    inner += '<polygon points="70,70 230,80 240,220 80,230" fill="none" stroke="#0b3d91" stroke-width="2"/>';
    inner += '<polygon points="70,70 230,80 240,220 80,230 90,215 230,90 85,80" fill="url(#resHash)" opacity="0.65"/>';
    inner += '<text x="155" y="150" text-anchor="middle" font-family="Arial,sans-serif" font-size="12" font-weight="700" fill="#0b3d91">R-2515</text>';
    inner += '<text x="155" y="168" text-anchor="middle" font-family="Arial,sans-serif" font-size="9" fill="#0b3d91">to 14,000 MSL</text>';
    inner += pilotMarker(150, 195, 'You');
    return svgWrap(inner);
}

/* 9. Obstacle tower with MSL/AGL height */
function chartObstacle() {
    var inner = '';
    // Class G airspace (no shading) — just airport off to the side
    inner += airportNonTowered(60, 240, 'KOPN');
    // Obstacle symbol (tall radio tower)
    inner += '<g>';
    // Base
    inner += '<line x1="170" y1="200" x2="170" y2="80" stroke="#202124" stroke-width="2"/>';
    // Top dot
    inner += '<circle cx="170" cy="80" r="3.5" fill="#202124"/>';
    // Diagonal supports
    inner += '<line x1="170" y1="200" x2="160" y2="195" stroke="#202124" stroke-width="1"/>';
    inner += '<line x1="170" y1="200" x2="180" y2="195" stroke="#202124" stroke-width="1"/>';
    // Lightning bolt indicating lighted obstacle
    inner += '<path d="M173,82 L180,76 L176,82 L182,76" fill="none" stroke="#202124" stroke-width="1.5"/>';
    inner += '</g>';
    // Heights label
    inner += '<text x="195" y="92" font-family="Arial,sans-serif" font-size="13" font-weight="800" fill="#202124">1849</text>';
    inner += '<text x="195" y="108" font-family="Arial,sans-serif" font-size="11" font-weight="600" fill="#202124">(450)</text>';
    // Drone marker near base
    inner += pilotMarker(220, 220, 'You');
    return svgWrap(inner);
}

/* 10. Towered vs non-towered airport comparison */
function chartAirportTypes() {
    var inner = '';
    // Two airport symbols side-by-side with labels
    inner += airportTowered(90, 150, 'KBLU');
    inner += '<text x="90" y="200" text-anchor="middle" font-family="Arial,sans-serif" font-size="10" font-weight="700" fill="#1a4ea3">Airport A</text>';
    inner += '<text x="90" y="215" text-anchor="middle" font-family="Arial,sans-serif" font-size="9" fill="#5f6368">CT - 118.3</text>';

    inner += airportNonTowered(210, 150, 'KMAG');
    inner += '<text x="210" y="200" text-anchor="middle" font-family="Arial,sans-serif" font-size="10" font-weight="700" fill="#b3257a">Airport B</text>';
    inner += '<text x="210" y="215" text-anchor="middle" font-family="Arial,sans-serif" font-size="9" fill="#5f6368">CTAF 122.8</text>';
    return svgWrap(inner);
}

/* -----------------------------------------------------
   Quiz Data — 10 questions, each tied to a chart
   ----------------------------------------------------- */
var chartQuestions = [
    {
        chart: chartClassB,
        question: 'The chart shows solid blue concentric circles around airport KBIG with the altitude label "100/SFC". A Part 107 pilot wants to operate at the marked location. What airspace class are they in?',
        options: [
            'Class B (surface to 10,000 ft MSL)',
            'Class C (surface to 4,100 ft MSL)',
            'Class G (uncontrolled)'
        ],
        answer: 0,
        explanation: 'Solid blue circles indicate Class B airspace. The "100/SFC" label means the ceiling is 10,000 feet MSL and the floor is the surface. Class B airspace surrounds the busiest airports and always requires prior FAA authorization for Part 107 operations.'
    },
    {
        chart: chartClassC,
        question: 'The chart shows solid magenta concentric circles around towered airport KMID. To operate a small UAS at the marked location, what authorization is required?',
        options: [
            'No authorization needed — Part 107 operations are always permitted below 400 ft AGL',
            'Prior FAA authorization (typically obtained through LAANC)',
            'Only a verbal radio call to the tower on CTAF'
        ],
        answer: 1,
        explanation: 'Solid magenta circles indicate Class C airspace. Under 14 CFR 107.41, operations in Class B, C, D, or surface-area Class E require prior FAA authorization. LAANC provides near-real-time approval based on the UAS Facility Map.'
    },
    {
        chart: chartClassD,
        question: 'The chart shows a dashed blue circle around airport KDEL with the number "25" inside a dashed blue box. What does the "25" represent?',
        options: [
            'The ceiling of the Class D airspace at 2,500 feet MSL',
            'The radius of the Class D airspace in nautical miles',
            'The maximum LAANC-approved altitude (25 feet AGL)'
        ],
        answer: 0,
        explanation: 'A dashed blue line depicts Class D airspace, and the number in the dashed blue box gives the ceiling in hundreds of feet MSL. So "25" means the Class D ceiling is 2,500 feet MSL. Two-way radio communication (and for Part 107, prior FAA authorization) is required to operate inside this airspace.'
    },
    {
        chart: chartClassESurface,
        question: 'A dashed magenta line surrounds non-towered airport KECO. The marked location is inside the dashed line. What does the dashed magenta line indicate, and what authorization does Part 107 require?',
        options: [
            'Class G airspace — no authorization needed',
            'Class E airspace extending to the surface — prior FAA authorization required',
            'A Military Operations Area — extreme caution but no authorization required'
        ],
        answer: 1,
        explanation: 'A dashed magenta boundary indicates Class E airspace that starts at the surface, often around non-towered airports with instrument approaches. Part 107 operations within a surface-area Class E airspace require prior FAA authorization (typically via LAANC), the same as Class B/C/D.'
    },
    {
        chart: chartClassE700,
        question: 'The chart shows faded magenta shading (vignette) on the left side of a boundary. A drone operating at 350 feet AGL inside that shaded area is in what airspace class?',
        options: [
            'Class E — authorization required',
            'Class G — no ATC authorization required at 350 ft AGL',
            'Class B — authorization required'
        ],
        answer: 1,
        explanation: 'Faded magenta shading indicates Class E airspace with a floor of 700 feet AGL on that side. Below 700 ft AGL the airspace is Class G (uncontrolled). Since Part 107 limits flight to 400 ft AGL and you are at 350 ft AGL, you are in Class G — no ATC authorization needed.'
    },
    {
        chart: chartClassE1200,
        question: 'The chart shows faded blue shading on the right side of a boundary line. What is the floor of the Class E airspace on the blue-shaded side?',
        options: [
            '700 feet AGL',
            '1,200 feet AGL',
            '14,500 feet MSL'
        ],
        answer: 1,
        explanation: 'Faded blue (vignette) shading on a sectional chart indicates Class E airspace with a floor of 1,200 feet AGL. This is the default Class E floor across most of the United States. Below 1,200 ft AGL the airspace is Class G.'
    },
    {
        chart: chartMOA,
        question: 'The chart shows a polygon outlined in magenta with magenta hash marks along its inner edge, labeled "BIG SKY MOA". A Part 107 pilot operating in Class G airspace at the marked location:',
        options: [
            'May not operate here under any circumstances — MOAs prohibit all aircraft',
            'May operate but should exercise extreme caution due to military activity; the MOA does not prohibit VFR/UAS operations',
            'Must obtain prior authorization from NORAD before entering'
        ],
        answer: 1,
        explanation: 'A magenta hashed boundary denotes a Military Operations Area (MOA). MOAs separate military training activities from IFR traffic but do NOT prohibit VFR or Part 107 UAS operations in underlying Class G airspace. Extreme caution is warranted because of possible high-speed military flight activity.'
    },
    {
        chart: chartRestricted,
        question: 'The chart shows a polygon outlined in blue with blue hash marks along its inner edge, labeled "R-2515". Can a Part 107 pilot operate inside this area?',
        options: [
            'Yes, freely — the "R" only applies to manned aircraft',
            'Only with permission from the controlling agency; entry is otherwise prohibited when the area is active',
            'Yes, as long as the pilot stays below 400 feet AGL'
        ],
        answer: 1,
        explanation: 'Blue hashing with an "R-####" designation indicates a Restricted Area. Restricted Areas contain hazards such as artillery firing or guided missiles. Entry is prohibited unless the controlling agency has granted permission. Always check NOTAMs to know when the area is active.'
    },
    {
        chart: chartObstacle,
        question: 'The obstacle shown on the chart is labeled "1849" on top and "(450)" in parentheses below. How tall is the obstacle above ground level (AGL)?',
        options: [
            '1,849 feet AGL',
            '450 feet AGL',
            '1,399 feet AGL (the difference)'
        ],
        answer: 1,
        explanation: 'On sectional charts, the bold top number is the obstacle height in feet MSL (1,849 ft) and the number in parentheses is the height above ground level — 450 ft AGL. Because Part 107 caps drone operations at 400 ft AGL, this obstacle exceeds the normal Part 107 altitude limit; you would need to use the 400 ft-above-a-structure rule and remain within 400 ft of the tower to legally fly above it.'
    },
    {
        chart: chartAirportTypes,
        question: 'The chart shows two airports: Airport A drawn in blue and Airport B drawn in magenta. What does the color difference tell you?',
        options: [
            'Airport A is a private airport and Airport B is public',
            'Airport A has an operating control tower (towered); Airport B has no operating control tower (non-towered)',
            'Airport A has paved runways and Airport B has turf runways'
        ],
        answer: 1,
        explanation: 'On VFR sectional charts, BLUE airport symbols indicate airports with an operating control tower (towered) and MAGENTA airport symbols indicate airports without an operating control tower (non-towered). Tower status — not pavement or ownership — is what determines the color.'
    }
];

/* -----------------------------------------------------
   Quiz State
   ----------------------------------------------------- */
var cqCurrentIdx = 0;
var cqUserAnswers = [];
var cqAnswered = [];

/* -----------------------------------------------------
   Quiz Lifecycle
   ----------------------------------------------------- */
function cqStart() {
    cqCurrentIdx = 0;
    cqUserAnswers = new Array(chartQuestions.length);
    cqAnswered = new Array(chartQuestions.length);
    for (var i = 0; i < chartQuestions.length; i++) {
        cqUserAnswers[i] = -1;
        cqAnswered[i] = false;
    }
    document.getElementById('cqIntro').style.display = 'none';
    document.getElementById('cqQuiz').style.display = 'block';
    document.getElementById('cqResults').style.display = 'none';
    cqRender();
}

function cqRender() {
    var q = chartQuestions[cqCurrentIdx];

    // Chart area
    var chartEl = document.getElementById('cqChart');
    chartEl.innerHTML = q.chart();

    // Question text
    document.getElementById('cqQuestionText').textContent = (cqCurrentIdx + 1) + '. ' + q.question;

    // Progress
    document.getElementById('cqProgress').textContent = 'Question ' + (cqCurrentIdx + 1) + ' of ' + chartQuestions.length;

    // Options
    var optionsEl = document.getElementById('cqOptions');
    optionsEl.innerHTML = '';
    for (var i = 0; i < q.options.length; i++) {
        var btn = document.createElement('button');
        btn.className = 'quiz-option';
        btn.type = 'button';
        btn.setAttribute('data-idx', i);
        btn.textContent = String.fromCharCode(65 + i) + '. ' + q.options[i];

        if (cqAnswered[cqCurrentIdx]) {
            btn.classList.add('disabled');
            if (i === q.answer) {
                btn.classList.add('correct');
            } else if (i === cqUserAnswers[cqCurrentIdx]) {
                btn.classList.add('incorrect');
            }
        }

        btn.onclick = (function (idx) {
            return function () {
                cqSelect(idx);
            };
        })(i);

        optionsEl.appendChild(btn);
    }

    // Explanation
    var expEl = document.getElementById('cqExplanation');
    if (cqAnswered[cqCurrentIdx]) {
        var correct = cqUserAnswers[cqCurrentIdx] === q.answer;
        expEl.className = 'quiz-explanation show ' + (correct ? 'correct' : 'incorrect');
        expEl.innerHTML = '<strong>' + (correct ? 'Correct!' : 'Not quite.') + '</strong> ' + q.explanation;
    } else {
        expEl.className = 'quiz-explanation';
        expEl.innerHTML = '';
    }

    // Footer buttons
    document.getElementById('cqPrev').disabled = (cqCurrentIdx === 0);

    var nextBtn = document.getElementById('cqNext');
    if (cqCurrentIdx === chartQuestions.length - 1) {
        nextBtn.textContent = 'See Results';
    } else {
        nextBtn.textContent = 'Next →';
    }
    nextBtn.disabled = !cqAnswered[cqCurrentIdx];
}

function cqSelect(optIdx) {
    if (cqAnswered[cqCurrentIdx]) return;
    cqUserAnswers[cqCurrentIdx] = optIdx;
    cqAnswered[cqCurrentIdx] = true;
    cqRender();
}

function cqNext() {
    if (!cqAnswered[cqCurrentIdx]) return;
    if (cqCurrentIdx === chartQuestions.length - 1) {
        cqShowResults();
        return;
    }
    cqCurrentIdx++;
    cqRender();
}

function cqPrev() {
    if (cqCurrentIdx === 0) return;
    cqCurrentIdx--;
    cqRender();
}

function cqShowResults() {
    var correct = 0;
    for (var i = 0; i < chartQuestions.length; i++) {
        if (cqUserAnswers[i] === chartQuestions[i].answer) correct++;
    }
    var pct = Math.round((correct / chartQuestions.length) * 100);
    var passed = pct >= 70;

    document.getElementById('cqQuiz').style.display = 'none';
    document.getElementById('cqResults').style.display = 'block';

    var scoreEl = document.getElementById('cqScore');
    scoreEl.textContent = pct + '%';
    scoreEl.className = 'score-display ' + (passed ? 'pass' : 'fail');

    var msgEl = document.getElementById('cqResultMsg');
    if (passed) {
        msgEl.textContent = 'Nice work! You answered ' + correct + ' of ' + chartQuestions.length + ' chart questions correctly.';
    } else {
        msgEl.textContent = 'You answered ' + correct + ' of ' + chartQuestions.length + ' correctly. Review Chapter 2 (Airspace) and try again.';
    }
}

function cqRetake() {
    cqStart();
}

/* Auto-start on page load */
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
        // Nothing to auto-run; intro screen is shown first
    });
}
