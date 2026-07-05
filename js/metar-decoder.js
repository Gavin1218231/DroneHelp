/* ============================================================
   METAR / TAF Decoder
   Plain ES5. Exposes global: MetarDecoder.decode(rawText)
   Returns: { tokens: [{ raw, type, meaning, category }], summary }
   ============================================================ */

var MetarDecoder = (function () {

    // ---- Lookup tables ----
    var REPORT_TYPES = {
        'METAR': 'Routine surface weather observation',
        'SPECI': 'Special (unscheduled) weather observation',
        'TAF':   'Terminal Aerodrome Forecast'
    };

    var SKY_COVER = {
        'SKC': 'Sky clear (manual)',
        'CLR': 'Sky clear below 12,000 ft (automated)',
        'NSC': 'No significant cloud',
        'NCD': 'No cloud detected',
        'FEW': 'Few clouds (1/8 to 2/8)',
        'SCT': 'Scattered clouds (3/8 to 4/8)',
        'BKN': 'Broken clouds (5/8 to 7/8)',
        'OVC': 'Overcast (8/8)',
        'VV':  'Vertical visibility (sky obscured)'
    };

    var CLOUD_TYPE = {
        'CB':  'Cumulonimbus (thunderstorm cloud)',
        'TCU': 'Towering cumulus'
    };

    var WX_INTENSITY = {
        '-': 'Light',
        '+': 'Heavy',
        'VC': 'In the vicinity'
    };

    var WX_DESCRIPTOR = {
        'MI': 'Shallow',
        'PR': 'Partial',
        'BC': 'Patches',
        'DR': 'Low drifting',
        'BL': 'Blowing',
        'SH': 'Showers',
        'TS': 'Thunderstorm',
        'FZ': 'Freezing'
    };

    var WX_PHENOMENA = {
        // Precipitation
        'DZ': 'Drizzle',
        'RA': 'Rain',
        'SN': 'Snow',
        'SG': 'Snow grains',
        'IC': 'Ice crystals',
        'PL': 'Ice pellets',
        'GR': 'Hail',
        'GS': 'Small hail / snow pellets',
        'UP': 'Unknown precipitation',
        // Obscuration
        'BR': 'Mist',
        'FG': 'Fog',
        'FU': 'Smoke',
        'VA': 'Volcanic ash',
        'DU': 'Widespread dust',
        'SA': 'Sand',
        'HZ': 'Haze',
        'PY': 'Spray',
        // Other
        'PO': 'Dust/sand whirls',
        'SQ': 'Squalls',
        'FC': 'Funnel cloud / tornado / waterspout',
        'SS': 'Sandstorm',
        'DS': 'Duststorm',
        'NSW': 'No significant weather'
    };

    var CHANGE_GROUPS = {
        'TEMPO': 'Temporary conditions expected',
        'BECMG': 'Becoming (gradual change)',
        'NOSIG': 'No significant change expected',
        'NSW':   'No significant weather'
    };

    // ---- Helpers ----
    function pad(n) { return n < 10 ? '0' + n : '' + n; }

    function degToCompass(deg) {
        var dirs = ['N','NNE','NE','ENE','E','ESE','SE','SSE',
                    'S','SSW','SW','WSW','W','WNW','NW','NNW'];
        return dirs[Math.round((deg % 360) / 22.5) % 16];
    }

    function mkToken(raw, type, meaning, category) {
        return {
            raw: raw,
            type: type,
            meaning: meaning,
            category: category || 'other'
        };
    }

    // ---- Token matchers ----

    function matchReportType(tok) {
        if (REPORT_TYPES[tok]) {
            return mkToken(tok, 'Report Type', REPORT_TYPES[tok], 'report');
        }
        return null;
    }

    function matchCor(tok) {
        if (tok === 'COR')   return mkToken(tok, 'Modifier', 'Corrected report', 'report');
        if (tok === 'AUTO')  return mkToken(tok, 'Modifier', 'Fully automated report (no human oversight)', 'report');
        if (tok === 'AMD')   return mkToken(tok, 'Modifier', 'Amended forecast', 'report');
        if (tok === 'NIL')   return mkToken(tok, 'Modifier', 'No data available', 'report');
        return null;
    }

    function matchStation(tok) {
        if (/^[A-Z]{4}$/.test(tok)) {
            return mkToken(tok, 'Station', 'ICAO airport identifier: ' + tok, 'station');
        }
        return null;
    }

    function matchDateTime(tok) {
        var m = tok.match(/^(\d{2})(\d{2})(\d{2})Z$/);
        if (m) {
            return mkToken(tok, 'Date/Time',
                'Day ' + m[1] + ' of month at ' + m[2] + ':' + m[3] + ' UTC (Zulu)',
                'time');
        }
        return null;
    }

    function matchTafValidity(tok) {
        var m = tok.match(/^(\d{2})(\d{2})\/(\d{2})(\d{2})$/);
        if (m) {
            return mkToken(tok, 'Valid Period',
                'Valid from day ' + m[1] + ' at ' + m[2] + ':00Z through day ' + m[3] + ' at ' + m[4] + ':00Z',
                'time');
        }
        return null;
    }

    function matchFromGroup(tok) {
        var m = tok.match(/^FM(\d{2})(\d{2})(\d{2})$/);
        if (m) {
            return mkToken(tok, 'Change Group',
                'From day ' + m[1] + ' at ' + m[2] + ':' + m[3] + 'Z — conditions change to:',
                'change');
        }
        return null;
    }

    function matchProb(tok) {
        var m = tok.match(/^PROB(\d{2})$/);
        if (m) {
            return mkToken(tok, 'Change Group',
                m[1] + '% probability of the following conditions',
                'change');
        }
        return null;
    }

    function matchChangeGroup(tok) {
        if (CHANGE_GROUPS[tok]) {
            return mkToken(tok, 'Change Group', CHANGE_GROUPS[tok], 'change');
        }
        return null;
    }

    function matchWind(tok) {
        // 00000KT calm
        if (/^00000(KT|MPS|KMH)$/.test(tok)) {
            return mkToken(tok, 'Wind', 'Calm (no wind)', 'wind');
        }
        // VRB winds: VRB03KT, VRB03G15KT
        var v = tok.match(/^VRB(\d{2,3})(?:G(\d{2,3}))?(KT|MPS|KMH)$/);
        if (v) {
            var unit = v[3] === 'KT' ? 'knots' : (v[3] === 'MPS' ? 'm/s' : 'km/h');
            var msg = 'Variable direction at ' + parseInt(v[1], 10) + ' ' + unit;
            if (v[2]) msg += ', gusting ' + parseInt(v[2], 10) + ' ' + unit;
            return mkToken(tok, 'Wind', msg, 'wind');
        }
        // dddffKT, dddffGffKT (3-digit dir, 2-3 digit speed)
        var m = tok.match(/^(\d{3})(\d{2,3})(?:G(\d{2,3}))?(KT|MPS|KMH)$/);
        if (m) {
            var dir = parseInt(m[1], 10);
            var spd = parseInt(m[2], 10);
            var gust = m[3] ? parseInt(m[3], 10) : null;
            var u = m[4] === 'KT' ? 'knots' : (m[4] === 'MPS' ? 'm/s' : 'km/h');
            var meaning = 'From ' + pad(dir) + '° (' + degToCompass(dir) + ') at ' + spd + ' ' + u;
            if (gust !== null) meaning += ', gusting ' + gust + ' ' + u;
            return mkToken(tok, 'Wind', meaning, 'wind');
        }
        return null;
    }

    function matchWindVariation(tok) {
        // e.g. 180V240 — variation in wind direction
        var m = tok.match(/^(\d{3})V(\d{3})$/);
        if (m) {
            return mkToken(tok, 'Wind Variation',
                'Wind direction varying between ' + parseInt(m[1], 10) + '° and ' + parseInt(m[2], 10) + '°',
                'wind');
        }
        return null;
    }

    function matchVisibility(tok) {
        if (tok === 'CAVOK') {
            return mkToken(tok, 'Visibility',
                'Ceiling and visibility OK: visibility >= 10 km, no clouds below 5,000 ft / MSA, no significant weather',
                'visibility');
        }
        // P-prefixed = "greater than" (e.g. P6SM)
        var mp = tok.match(/^P(\d{1,2})SM$/);
        if (mp) {
            return mkToken(tok, 'Visibility', 'Visibility greater than ' + mp[1] + ' statute miles', 'visibility');
        }
        // M-prefixed = "less than" (e.g. M1/4SM, M1/8SM, M1SM)
        var mm = tok.match(/^M(\d)\/(\d)SM$/);
        if (mm) {
            return mkToken(tok, 'Visibility', 'Visibility less than ' + mm[1] + '/' + mm[2] + ' statute mile', 'visibility');
        }
        mm = tok.match(/^M(\d{1,2})SM$/);
        if (mm) {
            return mkToken(tok, 'Visibility', 'Visibility less than ' + mm[1] + ' statute mile(s)', 'visibility');
        }
        // Whole SM: e.g. 10SM, 2SM
        var m = tok.match(/^(\d{1,2})SM$/);
        if (m) {
            return mkToken(tok, 'Visibility', parseInt(m[1], 10) + ' statute mile(s) visibility', 'visibility');
        }
        // Fractional SM: 1/2SM, 3/4SM
        m = tok.match(/^(\d)\/(\d)SM$/);
        if (m) {
            return mkToken(tok, 'Visibility', m[1] + '/' + m[2] + ' statute mile visibility', 'visibility');
        }
        // Mixed (handled at multi-token level usually): "1 1/2SM" — here we accept the fraction half only
        // 4-digit meters: 9999 = 10 km+
        if (/^\d{4}$/.test(tok)) {
            var meters = parseInt(tok, 10);
            if (meters === 9999) {
                return mkToken(tok, 'Visibility', 'Visibility 10 km or more', 'visibility');
            }
            if (meters <= 5000) {
                return mkToken(tok, 'Visibility', meters + ' meters visibility', 'visibility');
            }
        }
        return null;
    }

    function matchRvr(tok) {
        // R##/####FT or R##L/M####FT or R##/P####FT (P = greater than, M = less than)
        var m = tok.match(/^R(\d{2}[LRC]?)\/([MP]?)(\d{4})(?:V([MP]?)(\d{4}))?FT$/);
        if (m) {
            var rwy = m[1];
            var prefix = m[2] === 'M' ? 'less than ' : (m[2] === 'P' ? 'greater than ' : '');
            var meaning = 'Runway ' + rwy + ' visual range ' + prefix + m[3] + ' ft';
            if (m[5]) {
                var p2 = m[4] === 'M' ? 'less than ' : (m[4] === 'P' ? 'greater than ' : '');
                meaning += ', variable to ' + p2 + m[5] + ' ft';
            }
            return mkToken(tok, 'RVR', meaning, 'visibility');
        }
        return null;
    }

    function matchWeather(tok) {
        // Strip intensity (+, -) or VC
        var work = tok;
        var intensity = '';
        if (work.charAt(0) === '+' || work.charAt(0) === '-') {
            intensity = work.charAt(0);
            work = work.substring(1);
        } else if (work.substring(0, 2) === 'VC') {
            intensity = 'VC';
            work = work.substring(2);
        }
        if (work.length === 0 || work.length % 2 !== 0) return null;

        var parts = [];
        var descriptor = null;
        var phenomena = [];
        var i;
        for (i = 0; i < work.length; i += 2) {
            parts.push(work.substring(i, i + 2));
        }
        // Validate each chunk
        for (i = 0; i < parts.length; i++) {
            var p = parts[i];
            if (!WX_DESCRIPTOR[p] && !WX_PHENOMENA[p]) {
                return null; // Not a weather token
            }
            if (WX_DESCRIPTOR[p] && i === 0) {
                descriptor = p;
            } else if (WX_PHENOMENA[p]) {
                phenomena.push(p);
            } else if (WX_DESCRIPTOR[p]) {
                // descriptor in non-first position — treat as phenomenon-style for safety
                phenomena.push(p);
            }
        }
        if (parts.length === 0 || (descriptor === null && phenomena.length === 0)) return null;

        var words = [];
        if (intensity && WX_INTENSITY[intensity]) words.push(WX_INTENSITY[intensity]);
        if (descriptor) words.push(WX_DESCRIPTOR[descriptor]);
        var phWords = [];
        for (i = 0; i < phenomena.length; i++) {
            phWords.push(WX_PHENOMENA[phenomena[i]] || phenomena[i]);
        }
        if (phWords.length) words.push(phWords.join(' and '));

        return mkToken(tok, 'Weather', words.join(' '), 'weather');
    }

    function matchSky(tok) {
        if (tok === 'SKC' || tok === 'CLR' || tok === 'NSC' || tok === 'NCD') {
            return mkToken(tok, 'Sky', SKY_COVER[tok], 'sky');
        }
        if (tok === 'NCD') {
            return mkToken(tok, 'Sky', SKY_COVER[tok], 'sky');
        }
        // VV###
        var vv = tok.match(/^VV(\d{3})$/);
        if (vv) {
            return mkToken(tok, 'Sky',
                'Vertical visibility ' + (parseInt(vv[1], 10) * 100) + ' ft (sky obscured)',
                'sky');
        }
        // FEW250, SCT008, BKN015CB, OVC050
        var m = tok.match(/^(FEW|SCT|BKN|OVC)(\d{3})(CB|TCU)?$/);
        if (m) {
            var cover = SKY_COVER[m[1]];
            var alt = parseInt(m[2], 10) * 100;
            var meaning = cover + ' at ' + alt.toLocaleString() + ' ft AGL';
            if (m[3]) meaning += ' (' + CLOUD_TYPE[m[3]] + ')';
            return mkToken(tok, 'Sky', meaning, 'sky');
        }
        return null;
    }

    function matchTempDew(tok) {
        var m = tok.match(/^(M?\d{2})\/(M?\d{2})$/);
        if (m) {
            var t = m[1].charAt(0) === 'M' ? -parseInt(m[1].substring(1), 10) : parseInt(m[1], 10);
            var d = m[2].charAt(0) === 'M' ? -parseInt(m[2].substring(1), 10) : parseInt(m[2], 10);
            var tf = Math.round(t * 9 / 5 + 32);
            var df = Math.round(d * 9 / 5 + 32);
            return mkToken(tok, 'Temp/Dew',
                'Temperature ' + t + '°C (' + tf + '°F), Dewpoint ' + d + '°C (' + df + '°F)',
                'temp');
        }
        // Missing dew: 26/
        m = tok.match(/^(M?\d{2})\/$/);
        if (m) {
            var t2 = m[1].charAt(0) === 'M' ? -parseInt(m[1].substring(1), 10) : parseInt(m[1], 10);
            return mkToken(tok, 'Temp/Dew',
                'Temperature ' + t2 + '°C, Dewpoint not reported',
                'temp');
        }
        return null;
    }

    function matchAltimeter(tok) {
        var m = tok.match(/^A(\d{4})$/);
        if (m) {
            var inHg = (parseInt(m[1], 10) / 100).toFixed(2);
            return mkToken(tok, 'Altimeter', 'Altimeter setting ' + inHg + ' inHg', 'altimeter');
        }
        // Q1013 — QNH in hPa (international)
        m = tok.match(/^Q(\d{4})$/);
        if (m) {
            return mkToken(tok, 'Altimeter', 'QNH ' + parseInt(m[1], 10) + ' hPa', 'altimeter');
        }
        return null;
    }

    function matchRemarks(tok) {
        if (tok === 'RMK') {
            return mkToken(tok, 'Remarks', 'Beginning of remarks section (see remarks below)', 'remarks');
        }
        return null;
    }

    // ---- Tokenizer that joins "1 1/2SM" into one token ----
    function preTokenize(text) {
        var raw = text.replace(/\s+/g, ' ').trim();
        // Collapse "N N/NSM" into "N N/NSM"
        raw = raw.replace(/(\b\d)\s+(\d\/\d)SM\b/g, '$1 $2SM_JOIN');
        var parts = raw.split(' ');
        var out = [];
        var i;
        for (i = 0; i < parts.length; i++) {
            var p = parts[i];
            if (/_JOIN$/.test(p) && out.length) {
                var prev = out.pop();
                out.push(prev + ' ' + p.replace(/_JOIN$/, ''));
            } else {
                out.push(p);
            }
        }
        return out;
    }

    // Handle mixed visibility like "1 1/2SM" as a single visibility token
    function matchMixedVisibility(tok) {
        var m = tok.match(/^(\d)\s(\d)\/(\d)SM$/);
        if (m) {
            var whole = parseInt(m[1], 10);
            var num = parseInt(m[2], 10);
            var den = parseInt(m[3], 10);
            var val = whole + (num / den);
            return mkToken(tok, 'Visibility',
                whole + ' ' + num + '/' + den + ' (' + val.toFixed(2) + ') statute miles visibility',
                'visibility');
        }
        return null;
    }

    // ---- Main decode ----
    function decode(rawText) {
        if (!rawText || typeof rawText !== 'string') {
            return { tokens: [], summary: 'No input provided.' };
        }
        var tokens = preTokenize(rawText.toUpperCase());
        var out = [];
        var inRemarks = false;
        var summaryParts = {
            station: null,
            time: null,
            wind: null,
            visibility: null,
            weather: [],
            sky: [],
            temp: null,
            altimeter: null,
            reportType: null,
            valid: null
        };

        var i;
        for (i = 0; i < tokens.length; i++) {
            var tok = tokens[i];
            if (!tok) continue;

            if (inRemarks) {
                // Pass remarks through individually without deep decode
                out.push(mkToken(tok, 'Remark', 'Remarks data (see RMK reference)', 'remarks'));
                continue;
            }

            var decoded =
                matchReportType(tok) ||
                matchCor(tok) ||
                matchFromGroup(tok) ||
                matchProb(tok) ||
                matchChangeGroup(tok) ||
                matchTafValidity(tok) ||
                matchDateTime(tok) ||
                matchWind(tok) ||
                matchWindVariation(tok) ||
                matchMixedVisibility(tok) ||
                matchVisibility(tok) ||
                matchRvr(tok) ||
                matchWeather(tok) ||
                matchSky(tok) ||
                matchTempDew(tok) ||
                matchAltimeter(tok) ||
                matchRemarks(tok) ||
                matchStation(tok);

            if (!decoded) {
                decoded = mkToken(tok, 'Unknown', 'Unknown / passthrough token', 'other');
            }

            // Track summary
            if (decoded.type === 'Report Type') summaryParts.reportType = decoded.meaning;
            if (decoded.type === 'Station')     summaryParts.station = tok;
            if (decoded.type === 'Date/Time')   summaryParts.time = decoded.meaning;
            if (decoded.type === 'Valid Period') summaryParts.valid = decoded.meaning;
            if (decoded.type === 'Wind' && !summaryParts.wind) summaryParts.wind = decoded.meaning;
            if (decoded.type === 'Visibility' && !summaryParts.visibility) summaryParts.visibility = decoded.meaning;
            if (decoded.type === 'Weather') summaryParts.weather.push(decoded.meaning);
            if (decoded.type === 'Sky')     summaryParts.sky.push(decoded.meaning);
            if (decoded.type === 'Temp/Dew' && !summaryParts.temp) summaryParts.temp = decoded.meaning;
            if (decoded.type === 'Altimeter' && !summaryParts.altimeter) summaryParts.altimeter = decoded.meaning;

            out.push(decoded);

            if (decoded.type === 'Remarks') {
                inRemarks = true;
            }
        }

        return {
            tokens: out,
            summary: buildSummary(summaryParts)
        };
    }

    function buildSummary(s) {
        var lines = [];
        if (s.reportType) lines.push(s.reportType + '.');
        if (s.station)    lines.push('Station ' + s.station + '.');
        if (s.time)       lines.push(s.time + '.');
        if (s.valid)      lines.push(s.valid + '.');
        if (s.wind)       lines.push('Wind: ' + s.wind + '.');
        if (s.visibility) lines.push('Visibility: ' + s.visibility + '.');
        if (s.weather.length) lines.push('Weather: ' + s.weather.join('; ') + '.');
        if (s.sky.length) lines.push('Sky: ' + s.sky.join('; ') + '.');
        if (s.temp)       lines.push(s.temp + '.');
        if (s.altimeter)  lines.push(s.altimeter + '.');
        if (lines.length === 0) return 'No recognized weather data.';
        return lines.join(' ');
    }

    // Public API
    return {
        decode: decode
    };
})();
