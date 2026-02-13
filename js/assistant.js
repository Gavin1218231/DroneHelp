// Part 107 AI Study Assistant
// Knowledge-base driven chatbot for Part 107 exam preparation

(function () {
    'use strict';

    // =========================================
    // Knowledge Base
    // =========================================
    var KB = [
        // --- REGULATIONS ---
        {
            keywords: ['max altitude', 'maximum altitude', 'how high', 'altitude limit', 'height limit', '400 feet', '400 ft', 'altitude restriction'],
            topic: 'regulations',
            answer: 'Under <strong>14 CFR 107.51</strong>, the maximum altitude for sUAS is <strong>400 feet AGL</strong> (above ground level).<br><br>There is one key exception: you may fly higher than 400 ft AGL if the drone is flown within a <strong>400-foot radius of a structure</strong> and does not fly higher than 400 feet above that structure\'s immediate uppermost limit.<br><br>This is one of the most commonly tested rules on the exam!'
        },
        {
            keywords: ['max speed', 'maximum speed', 'how fast', 'speed limit', 'groundspeed', '87 knots', '100 mph', 'speed restriction'],
            topic: 'regulations',
            answer: 'The maximum groundspeed for sUAS under Part 107 is <strong>87 knots (100 mph)</strong>, as stated in <strong>14 CFR 107.51</strong>.<br><br>Remember: this is <em>groundspeed</em>, not airspeed. A waiver can be requested to exceed this limit if you can demonstrate safe operations.'
        },
        {
            keywords: ['weight limit', 'max weight', 'maximum weight', 'how heavy', '55 pounds', '55 lbs', 'weight restriction', 'weight requirement'],
            topic: 'regulations',
            answer: 'Part 107 applies to small unmanned aircraft weighing <strong>less than 55 pounds</strong> (including everything on board or attached at the time of takeoff).<br><br>This means the drone + battery + payload + any attached equipment must total under 55 lbs.<br><br>For <strong>registration</strong>, drones weighing between <strong>0.55 lbs (250g) and 55 lbs</strong> must be registered with the FAA. The fee is <strong>$5 for 3 years</strong>.'
        },
        {
            keywords: ['visibility', 'minimum visibility', 'flight visibility', 'how far see', '3 statute miles', '3 sm', 'visibility requirement'],
            topic: 'regulations',
            answer: 'Under <strong>14 CFR 107.51</strong>, the minimum flight visibility must be no less than <strong>3 statute miles</strong>, as observed from the location of the control station.<br><br>This is the same as the VFR minimums in Class G airspace. If visibility drops below 3 SM, you cannot legally fly under Part 107 without a waiver.'
        },
        {
            keywords: ['cloud clearance', 'cloud distance', 'clouds', 'how far from clouds', 'cloud requirement', '500 feet below', '2000 feet horizontal'],
            topic: 'regulations',
            answer: 'Cloud clearance requirements under <strong>14 CFR 107.51</strong>:<ul><li><strong>500 feet below</strong> clouds</li><li><strong>2,000 feet horizontally</strong> from clouds</li></ul>These match VFR minimums for Class G airspace. If you cannot maintain these clearances, you must not fly (or obtain a waiver).'
        },
        {
            keywords: ['remote pilot certificate', 'pilot certificate', 'certification', 'how to get certified', 'become a pilot', 'get license', 'drone license', 'pilot requirements', 'certificate requirements'],
            topic: 'regulations',
            answer: 'To obtain a <strong>Remote Pilot Certificate</strong> with a small UAS rating:<ul><li>Must be at least <strong>16 years old</strong></li><li>Able to read, speak, and understand <strong>English</strong></li><li>Be in a physical and mental condition to safely fly</li><li>Pass the <strong>FAA Aeronautical Knowledge Test</strong> (60 questions, 70% to pass)</li><li>Pass <strong>TSA security vetting</strong></li></ul><strong>Existing Part 61 pilots</strong> (with a current flight review within 24 months) can take the online training course instead of the full knowledge test and receive immediate temporary certification.'
        },
        {
            keywords: ['night', 'fly at night', 'night operations', 'night flying', 'anti-collision', 'lighting', 'twilight', 'after dark', 'before sunrise', 'after sunset'],
            topic: 'regulations',
            answer: 'As of the 2021 rule update, Part 107 pilots <strong>can fly at night</strong> without a waiver, provided:<ul><li>The drone has <strong>anti-collision lighting</strong> visible for at least <strong>3 statute miles</strong></li><li>The remote PIC has completed the updated <strong>initial or recurrent training/testing</strong> that includes night operations</li></ul><strong>Daylight operations</strong> are from 30 minutes before official sunrise to 30 minutes after official sunset. <strong>Twilight</strong> (civil twilight) also requires anti-collision lighting.'
        },
        {
            keywords: ['waiver', 'waivers', 'part 107 waiver', 'request waiver', 'exemption', 'dronezone waiver'],
            topic: 'regulations',
            answer: 'You can request a <strong>waiver</strong> for most Part 107 operating restrictions through the <strong>FAA DroneZone</strong> portal. Common waivers include:<ul><li>Operations beyond visual line of sight (BVLOS)</li><li>Operations over people (prior to the category system)</li><li>Night operations (for those without updated training)</li><li>Multiple drones by one pilot</li><li>Altitude above 400 ft AGL</li><li>Speed above 87 knots</li></ul>You must demonstrate that the operation can be conducted <strong>safely</strong> under the waiver. Processing times vary but can take weeks to months.'
        },
        {
            keywords: ['registration', 'register drone', 'faa registration', 'registration fee', 'drone registration', 'register', '$5'],
            topic: 'regulations',
            answer: 'FAA drone registration requirements:<ul><li>Drones weighing <strong>0.55 lbs (250g) to 55 lbs</strong> must be registered</li><li>Registration fee: <strong>$5 for 3 years</strong></li><li>Register at <strong>FAA DroneZone</strong> (faadronezone.faa.gov)</li><li>Registration number must be <strong>displayed on the aircraft</strong> (visible and legible)</li><li>One registration can cover <strong>multiple drones</strong> for recreational use, but Part 107 requires individual registration per aircraft</li></ul>'
        },
        {
            keywords: ['accident report', 'reporting', 'report to faa', 'incident report', '10 days', '$500', 'serious injury', 'loss of consciousness'],
            topic: 'regulations',
            answer: 'Under <strong>14 CFR 107.9</strong>, you must report to the FAA within <strong>10 days</strong> any operation that results in:<ul><li><strong>Serious injury</strong> to any person</li><li><strong>Loss of consciousness</strong> of any person</li><li><strong>Property damage</strong> of at least <strong>$500</strong> (other than to the drone itself)</li></ul>Reports are filed through the FAA. Remember: damage to the drone itself does NOT count toward the $500 threshold.'
        },
        {
            keywords: ['recurrent', 'recurrent training', 'renew', 'renewal', 'certificate renewal', 'how long valid', '24 months', 'keep current'],
            topic: 'regulations',
            answer: 'Remote pilot certificates must be kept current through <strong>recurrent training every 24 months</strong>.<br><br>Since 2021, recurrent training is done via a <strong>free online course</strong> through the FAA Safety Team (FAASTeam). You no longer need to retake the knowledge test at a testing center.<br><br>The recurrent training covers regulations and operations but does <strong>not</strong> test weather or loading/performance topics.'
        },
        {
            keywords: ['moving vehicle', 'drive and fly', 'fly from car', 'fly from vehicle', 'moving aircraft'],
            topic: 'regulations',
            answer: 'Operating from a moving vehicle or aircraft:<ul><li><strong>Moving vehicle:</strong> Allowed only over a <strong>sparsely populated area</strong> and NOT for the transportation of property for compensation or hire</li><li><strong>Moving aircraft:</strong> <strong>Never allowed</strong> under Part 107</li></ul>Operating from a stationary vehicle is always permitted.'
        },
        {
            keywords: ['right of way', 'yield', 'manned aircraft', 'priority'],
            topic: 'regulations',
            answer: 'Under <strong>14 CFR 107.37</strong>, small unmanned aircraft must <strong>always yield the right of way to manned aircraft</strong>.<br><br>If you see or become aware of a manned aircraft in the area, you must immediately take action to avoid it. Manned aircraft always have priority. This applies regardless of whether you are in controlled or uncontrolled airspace.'
        },
        {
            keywords: ['operations over people', 'fly over people', 'over people', 'category 1', 'category 2', 'category 3', 'category 4', 'cat 1', 'cat 2', 'cat 3', 'cat 4'],
            topic: 'regulations',
            answer: 'Operations over people have <strong>4 categories</strong>:<br><br><strong>Category 1:</strong> Aircraft weighs <strong>0.55 lbs (250g) or less</strong> including everything on board. No exposed rotating parts that could lacerate skin.<br><br><strong>Category 2:</strong> Aircraft must not cause serious injury. Requires <strong>FAA-accepted means of compliance</strong> (Declaration of Compliance from manufacturer).<br><br><strong>Category 3:</strong> Same injury standard as Cat 2, but <strong>cannot sustain flight over open-air assemblies</strong> of people. Must not fly over people unless they are under a covered structure or inside a vehicle.<br><br><strong>Category 4:</strong> Requires an <strong>airworthiness certificate</strong> and must operate within its operating limitations. Equivalent to certified manned aircraft standards.'
        },
        {
            keywords: ['remote id', 'remote identification', 'broadcast', 'fria', 'remote id requirement', 'drone id'],
            topic: 'regulations',
            answer: '<strong>Remote ID</strong> has been required since <strong>March 16, 2024</strong>. Three ways to comply:<ul><li><strong>Standard Remote ID:</strong> Built into the drone; broadcasts drone ID, location, altitude, control station location, and timestamp</li><li><strong>Remote ID Broadcast Module:</strong> An add-on device attached to drones without built-in Remote ID</li><li><strong>FRIA (FAA-Recognized Identification Area):</strong> Fly without Remote ID within specific areas established by community-based organizations</li></ul>Remote ID helps the FAA, law enforcement, and national security agencies identify drones in flight.'
        },
        {
            keywords: ['visual line of sight', 'vlos', 'line of sight', 'see the drone', 'bvlos', 'beyond visual'],
            topic: 'regulations',
            answer: 'Under <strong>14 CFR 107.31</strong>, the remote PIC and any person manipulating the controls must maintain <strong>visual line of sight (VLOS)</strong> with the drone at all times.<ul><li>Must be able to see the aircraft with <strong>unaided vision</strong> (corrective lenses like glasses are fine)</li><li><strong>Binoculars, FPV goggles, or monitors</strong> cannot be used as the primary means of maintaining VLOS</li><li>Must be able to determine the drone\'s <strong>location, attitude, altitude, and direction of flight</strong></li><li>A <strong>visual observer</strong> can help scan for hazards but does NOT satisfy the VLOS requirement alone</li></ul>A waiver is required for beyond visual line of sight (BVLOS) operations.'
        },
        {
            keywords: ['visual observer', 'vo', 'observer role', 'do i need observer'],
            topic: 'regulations',
            answer: 'A <strong>Visual Observer (VO)</strong> is <strong>not required</strong> under Part 107, but is recommended for complex operations.<br><br>Key points about VOs:<ul><li>Helps maintain situational awareness and scan for hazards</li><li>Must be able to <strong>communicate with the remote PIC</strong> at all times</li><li>Does NOT need a remote pilot certificate</li><li>Does <strong>not</strong> satisfy the VLOS requirement on behalf of the PIC</li><li>Cannot manipulate the flight controls</li></ul>'
        },
        {
            keywords: ['alcohol', 'drinking', 'drugs', 'bottle to throttle', '8 hours', 'bac', 'intoxicated', 'impaired'],
            topic: 'regulations',
            answer: 'Under <strong>14 CFR 107.27</strong>, alcohol and drug rules:<ul><li><strong>8-hour "bottle-to-throttle" rule:</strong> Cannot operate within 8 hours of consuming any alcoholic beverage</li><li><strong>BAC limit:</strong> Blood alcohol concentration must be below <strong>0.04%</strong></li><li>Cannot operate under the influence of <strong>any drug</strong> that affects safety</li><li>These rules apply to the <strong>remote PIC, person manipulating controls, and visual observer</strong></li></ul>Violation of alcohol/drug rules can result in certificate revocation and FAA enforcement action.'
        },
        {
            keywords: ['commercial', 'recreational', 'hobby', 'business use', 'do i need part 107', 'when do i need', 'money', 'compensation'],
            topic: 'regulations',
            answer: 'You need a <strong>Part 107 certificate</strong> for any <strong>commercial</strong> (non-recreational) drone operation. This includes:<ul><li>Real estate photography/videography</li><li>Construction site inspections</li><li>Agriculture surveys</li><li>Monetized YouTube or social media content</li><li>Any work done for compensation or in furtherance of a business</li></ul><strong>Recreational flying</strong> falls under the Exception for Limited Recreational Operations (Section 44809) and has different rules. Even sub-250g drones require Part 107 for commercial use.'
        },

        // --- AIRSPACE ---
        {
            keywords: ['class b', 'class bravo', 'busiest airports', 'solid blue'],
            topic: 'airspace',
            answer: '<strong>Class B Airspace</strong> surrounds the nation\'s <strong>busiest airports</strong> (like LAX, JFK, ORD).<ul><li>Indicated by <strong>solid blue lines</strong> on sectional charts</li><li>Shaped like an <strong>"upside-down wedding cake"</strong> with layers of increasing floor altitudes radiating outward</li><li><strong>ATC authorization required</strong> for all drone operations</li><li>Typically extends from the surface up to 10,000 ft MSL at the center</li></ul>Use <strong>LAANC</strong> or <strong>DroneZone</strong> to request authorization.'
        },
        {
            keywords: ['class c', 'class charlie', 'solid magenta', 'larger airports'],
            topic: 'airspace',
            answer: '<strong>Class C Airspace</strong> surrounds <strong>larger airports</strong> with control towers and radar approach control.<ul><li>Indicated by <strong>solid magenta lines</strong> on sectional charts</li><li>Typically has a <strong>two-shelf structure</strong> (inner ring: surface to ~4,000 ft; outer ring: ~1,200 ft to ~4,000 ft)</li><li><strong>ATC authorization required</strong> for drone operations</li><li>Extends from the surface to typically 4,000 ft AGL at the center</li></ul>'
        },
        {
            keywords: ['class d', 'class delta', 'dashed blue', 'medium airport'],
            topic: 'airspace',
            answer: '<strong>Class D Airspace</strong> surrounds airports with an <strong>operating control tower</strong>.<ul><li>Indicated by <strong>dashed blue lines</strong> on sectional charts</li><li>A <strong>blue number in a blue box</strong> indicates the airspace ceiling (e.g., "30" = 3,000 ft MSL)</li><li><strong>ATC authorization required</strong> for drone operations</li><li>When the tower is <strong>closed</strong>, Class D typically reverts to <strong>Class E or G</strong></li></ul>'
        },
        {
            keywords: ['class e', 'class echo', 'controlled airspace', 'magenta shading', 'dashed magenta'],
            topic: 'airspace',
            answer: '<strong>Class E Airspace</strong> is the most common controlled airspace in the US. Key chart indicators:<ul><li><strong>Dashed magenta line:</strong> Class E begins at the <strong>surface</strong> &mdash; ATC auth required for drones</li><li><strong>Faded/shaded magenta:</strong> Class E begins at <strong>700 ft AGL</strong> &mdash; below 700 ft is Class G, so no auth needed for typical drone ops</li><li><strong>Blue shading (zipper line):</strong> Class E begins at <strong>1,200 ft AGL</strong> &mdash; below is Class G</li></ul><strong>Key exam tip:</strong> Only Class E that starts at the <strong>surface</strong> (dashed magenta) requires ATC authorization for Part 107 ops.'
        },
        {
            keywords: ['class g', 'uncontrolled', 'no authorization', 'go fly'],
            topic: 'airspace',
            answer: '<strong>Class G Airspace</strong> is <strong>uncontrolled airspace</strong>.<ul><li><strong>No ATC authorization needed</strong> for Part 107 operations</li><li>Not explicitly marked on sectional charts &mdash; it\'s the space that isn\'t designated as A, B, C, D, or E</li><li>Extends from the <strong>surface to the base</strong> of the overlying Class E airspace</li><li>Most typical Part 107 operations occur in Class G</li></ul><strong>Memory aid: Class G = Go!</strong> You can fly here with your Part 107 certificate without additional authorization.'
        },
        {
            keywords: ['airspace classes', 'airspace types', 'which airspace', 'all airspace', 'airspace overview', 'airspace summary', 'airspace classification'],
            topic: 'airspace',
            answer: 'Airspace classification summary for drone pilots:<br><br><strong>Controlled (ATC auth required for drones):</strong><ul><li><strong>Class A:</strong> 18,000&ndash;60,000 ft MSL (not relevant for drones)</li><li><strong>Class B:</strong> Busiest airports, solid blue lines</li><li><strong>Class C:</strong> Larger airports, solid magenta lines</li><li><strong>Class D:</strong> Medium airports, dashed blue lines</li><li><strong>Class E (surface):</strong> Dashed magenta lines</li></ul><strong>Uncontrolled (no ATC auth needed):</strong><ul><li><strong>Class E (700+ ft floor):</strong> Shaded magenta (below 700 ft is G)</li><li><strong>Class G:</strong> Uncontrolled, not explicitly marked</li></ul><strong>Tip:</strong> Part 107 requires ATC auth for Class B, C, D, and surface-level Class E.'
        },
        {
            keywords: ['laanc', 'authorization', 'low altitude authorization', 'get permission', 'airspace authorization', 'dronezone'],
            topic: 'airspace',
            answer: '<strong>LAANC</strong> (Low Altitude Authorization and Notification Capability) provides <strong>near real-time airspace authorization</strong>.<ul><li>Available through approved apps (Aloft, AirMap, KittyHawk, etc.)</li><li>Covers <strong>530+ FAA ATC facilities</strong> and <strong>726+ airports</strong></li><li>Authorizations are granted almost instantly for flights at or below published altitude limits</li><li>For requests above LAANC limits, use <strong>FAA DroneZone</strong> for manual authorization</li></ul>Always check for authorization <strong>before</strong> flying in controlled airspace!'
        },
        {
            keywords: ['tfr', 'temporary flight restriction', 'notam', 'notice to airmen', 'flight restriction'],
            topic: 'airspace',
            answer: '<strong>TFRs (Temporary Flight Restrictions)</strong> are temporary airspace restrictions that can be issued for:<ul><li>Presidential or VIP movements</li><li>Sporting events (stadiums)</li><li>Disaster/emergency response areas</li><li>Wildfire suppression operations</li><li>Space launch operations</li></ul><strong>Always check TFRs before every flight!</strong> Check at tfr.faa.gov or through flight planning apps.<br><br><strong>NOTAMs (Notices to Air Missions)</strong> provide time-critical information about conditions that could affect flight safety. Check at notams.faa.gov.'
        },
        {
            keywords: ['special use', 'prohibited', 'restricted', 'moa', 'military', 'warning area', 'alert area'],
            topic: 'airspace',
            answer: '<strong>Special Use Airspace:</strong><ul><li><strong>Prohibited Areas (P-xxx):</strong> Flight is <strong>completely prohibited</strong> (e.g., P-56 over the White House). <em>No waivers available.</em></li><li><strong>Restricted Areas (R-xxx):</strong> Hazardous activities (military operations, artillery). Flight restricted during active times; may be available when not active.</li><li><strong>MOAs (Military Operations Areas):</strong> Military training. Not prohibited for drones but <strong>exercise extreme caution</strong>.</li><li><strong>Warning Areas:</strong> Similar to restricted but over international waters.</li><li><strong>Alert Areas:</strong> High volume of pilot training or unusual aerial activity. Extra vigilance required.</li></ul>'
        },
        {
            keywords: ['sectional chart', 'read chart', 'chart symbols', 'how to read', 'vfr chart', 'sectional'],
            topic: 'airspace',
            answer: 'Key sectional chart reading tips for Part 107:<ul><li><strong>Solid blue lines</strong> = Class B airspace</li><li><strong>Solid magenta lines</strong> = Class C airspace</li><li><strong>Dashed blue lines</strong> = Class D airspace</li><li><strong>Dashed magenta lines</strong> = Class E surface</li><li><strong>Faded magenta shading</strong> = Class E at 700 ft AGL</li><li><strong>Blue numbers in boxes</strong> = Airspace ceiling (in hundreds of feet MSL)</li><li><strong>Inverted V with dot</strong> = Obstruction/tower with altitude</li><li><strong>Blue/magenta airport symbols</strong> = Airports (blue = towered, magenta = non-towered)</li></ul>All altitudes on sectional charts are in <strong>MSL</strong> (Mean Sea Level) unless noted as AGL.'
        },

        // --- WEATHER ---
        {
            keywords: ['metar', 'meteorological', 'weather report', 'how to read metar', 'decode metar', 'metar format'],
            topic: 'weather',
            answer: '<strong>METAR</strong> (Meteorological Aerodrome Report) is an hourly weather observation. Format:<br><br><code>METAR KJFK 121856Z 31012G20KT 10SM FEW250 M04/M18 A3038</code><ul><li><strong>KJFK</strong> &ndash; Station identifier</li><li><strong>121856Z</strong> &ndash; 12th day, 18:56 UTC (Zulu time)</li><li><strong>31012G20KT</strong> &ndash; Wind from 310&deg; at 12 knots, gusting to 20</li><li><strong>10SM</strong> &ndash; Visibility 10 statute miles</li><li><strong>FEW250</strong> &ndash; Few clouds at 25,000 ft AGL</li><li><strong>M04/M18</strong> &ndash; Temp &minus;4&deg;C / Dewpoint &minus;18&deg;C (M = minus)</li><li><strong>A3038</strong> &ndash; Altimeter setting 30.38 inHg</li></ul>This is one of the <strong>most tested topics</strong> on the exam!'
        },
        {
            keywords: ['taf', 'terminal aerodrome forecast', 'weather forecast', 'taf format', 'decode taf'],
            topic: 'weather',
            answer: '<strong>TAF</strong> (Terminal Aerodrome Forecast) is a weather forecast valid for <strong>24&ndash;30 hours</strong>, issued 4 times daily.<br><br>TAFs use similar encoding to METARs but include change groups:<ul><li><strong>FM</strong> (From): Permanent change expected from a specific time</li><li><strong>TEMPO</strong>: Temporary fluctuations expected (less than 1 hour at a time)</li><li><strong>BECMG</strong> (Becoming): Gradual change expected over a time period</li><li><strong>PROB30/PROB40</strong>: Probability of conditions (30% or 40% chance)</li></ul>TAFs are essential for <strong>flight planning</strong> since they show expected conditions.'
        },
        {
            keywords: ['density altitude', 'high altitude', 'hot', 'humid', '3 hs', 'performance altitude', 'thin air'],
            topic: 'weather',
            answer: '<strong>Density altitude</strong> is pressure altitude corrected for non-standard temperature. It indicates how the air "feels" to your drone\'s motors and propellers.<br><br>High density altitude (poor performance) is caused by the <strong>"3 H\'s":</strong><ul><li><strong>High</strong> elevation/altitude</li><li><strong>Hot</strong> temperature</li><li><strong>Humid</strong> conditions</li></ul>Effects on drones: reduced lift, decreased battery efficiency, motors working harder, shorter flight times.<br><br><strong>Standard atmosphere</strong> at sea level: 15&deg;C, 29.92 inHg. Any deviation increases or decreases density altitude.'
        },
        {
            keywords: ['thunderstorm', 'thunderstorms', 'convective', 'microburst', 'downburst', 'lightning'],
            topic: 'weather',
            answer: '<strong>Thunderstorms</strong> have three stages:<ol><li><strong>Cumulus (developing):</strong> Updrafts only, building cumulus clouds</li><li><strong>Mature:</strong> Both updrafts AND downdrafts, heaviest rain, lightning, hail, most dangerous phase</li><li><strong>Dissipating:</strong> Mostly downdrafts, storm weakens</li></ol><strong>Microbursts</strong> are intense, localized downdrafts from thunderstorms that spread outward on contact with the ground. Extremely dangerous for any aircraft.<br><br><strong>Rule of thumb:</strong> Stay at least <strong>30 minutes and 20 miles away</strong> from any thunderstorm activity. Never fly in or near thunderstorms!'
        },
        {
            keywords: ['wind shear', 'temperature inversion', 'inversion', 'wind change'],
            topic: 'weather',
            answer: '<strong>Wind shear</strong> is a sudden change in wind speed and/or direction over a short distance. It can be horizontal or vertical.<br><br>Common causes:<ul><li>Thunderstorms and microbursts</li><li><strong>Temperature inversions</strong></li><li>Frontal boundaries</li><li>Terrain and obstacles</li></ul><strong>Temperature inversions</strong> occur when warm air sits on top of cold air (the reverse of normal). Effects:<ul><li>Trap pollutants and reduce visibility near the surface</li><li>Create <strong>low-level wind shear</strong> at the inversion boundary</li><li>Can produce smooth air below the inversion but turbulence at and above it</li></ul>'
        },
        {
            keywords: ['cloud types', 'cumulus', 'stratus', 'cirrus', 'cloud', 'sky condition', 'few', 'scattered', 'broken', 'overcast'],
            topic: 'weather',
            answer: '<strong>Cloud types:</strong><ul><li><strong>Cumulus:</strong> Puffy, cotton-ball clouds. Indicate convective activity (unstable air).</li><li><strong>Stratus:</strong> Flat, layered clouds. Associated with stable air, steady precipitation.</li><li><strong>Cirrus:</strong> Thin, wispy, high-altitude ice crystal clouds.</li><li><strong>Cumulonimbus (CB):</strong> Thunderstorm clouds. Avoid!</li></ul><strong>METAR cloud coverage codes:</strong><ul><li><strong>SKC/CLR:</strong> Sky clear</li><li><strong>FEW:</strong> 1/8 &ndash; 2/8 coverage</li><li><strong>SCT:</strong> Scattered (3/8 &ndash; 4/8)</li><li><strong>BKN:</strong> Broken (5/8 &ndash; 7/8)</li><li><strong>OVC:</strong> Overcast (8/8)</li></ul>Cloud heights in METARs are in <strong>feet AGL</strong>.'
        },
        {
            keywords: ['fog', 'mist', 'dew point', 'dewpoint', 'temperature dew point spread', 'visibility reduced'],
            topic: 'weather',
            answer: 'When <strong>temperature and dew point converge</strong> (spread decreases to within 2&ndash;3&deg;C), <strong>fog or low clouds</strong> are likely to form.<br><br>Types of fog:<ul><li><strong>Radiation fog:</strong> Forms on clear, calm nights as ground cools. Burns off after sunrise.</li><li><strong>Advection fog:</strong> Warm, moist air moves over a cool surface. Can persist for days.</li><li><strong>Upslope fog:</strong> Moist air pushed up terrain features.</li></ul>Fog reduces visibility below 3 statute miles, making Part 107 operations illegal without a waiver. Always check the <strong>temperature/dew point spread</strong> in METARs!'
        },
        {
            keywords: ['weather source', 'weather briefing', 'where to check weather', 'aviation weather', '1800wxbrief', 'awc'],
            topic: 'weather',
            answer: 'Key aviation weather sources for drone pilots:<ul><li><strong>Aviation Weather Center (aviationweather.gov):</strong> METARs, TAFs, AIRMETs, SIGMETs, and weather maps</li><li><strong>1800WxBrief (1800wxbrief.com):</strong> Flight Service Station for weather briefings</li><li><strong>AIRMETs:</strong> Advisories for moderate icing, turbulence, sustained winds 30+ knots, and visibility below 3 miles</li><li><strong>SIGMETs:</strong> Significant meteorological info for severe weather (severe turbulence, icing, volcanic ash)</li><li><strong>Convective SIGMETs:</strong> Specifically for thunderstorm activity</li></ul>Always get a weather briefing before every flight!'
        },
        {
            keywords: ['standard atmosphere', 'standard pressure', 'standard temperature', '29.92', '15 degrees', 'altimeter setting'],
            topic: 'weather',
            answer: '<strong>Standard atmosphere</strong> at sea level:<ul><li>Temperature: <strong>15&deg;C (59&deg;F)</strong></li><li>Pressure: <strong>29.92 inHg (1013.2 hPa)</strong></li><li>Temperature lapse rate: approximately <strong>2&deg;C per 1,000 ft</strong> increase in altitude</li></ul>These values are the baseline. When actual conditions differ from standard, density altitude changes accordingly.'
        },

        // --- LOADING & PERFORMANCE ---
        {
            keywords: ['center of gravity', 'cg', 'balance', 'weight and balance', 'loading', 'payload'],
            topic: 'loading',
            answer: '<strong>Center of Gravity (CG)</strong> is the point where the aircraft would balance if suspended. Proper CG is critical for drone stability.<ul><li><strong>CG too far forward:</strong> Nose-heavy, requires more power to maintain level flight</li><li><strong>CG too far aft/back:</strong> Tail-heavy, can become uncontrollable</li><li><strong>CG offset laterally:</strong> Drone will tilt and drift, increased power consumption</li></ul><strong>Best practices:</strong><ul><li>Center your payload as much as possible</li><li>Secure all payloads firmly</li><li>Stay within manufacturer\'s weight and balance limits</li><li>Do a test hover after loading to verify stable flight</li></ul>'
        },
        {
            keywords: ['overloading', 'overweight', 'too heavy', 'excess weight', 'over weight limit'],
            topic: 'loading',
            answer: 'Effects of <strong>overloading</strong> a drone:<ul><li><strong>Reduced maneuverability</strong> and slower response to controls</li><li><strong>Increased battery drain</strong> and shorter flight time</li><li><strong>Higher stall speed</strong> (less margin of safety)</li><li><strong>Structural stress</strong> on frame, motors, and propellers</li><li><strong>Longer takeoff/landing distances</strong></li><li><strong>Increased risk of motor or ESC burnout</strong></li></ul>Always check the manufacturer\'s maximum takeoff weight and stay within limits. Remember: Part 107 max is <strong>55 lbs total</strong> (aircraft + everything on board).'
        },
        {
            keywords: ['battery', 'lipo', 'battery performance', 'battery life', 'cold battery', 'battery temperature'],
            topic: 'loading',
            answer: '<strong>Battery performance factors:</strong><ul><li><strong>Cold temperatures:</strong> LiPo batteries lose capacity significantly in cold weather. Pre-warm batteries before flight in winter.</li><li><strong>Heat:</strong> Excessive heat degrades battery life and can cause swelling/failure.</li><li><strong>Payload weight:</strong> Heavier loads = more current draw = shorter flight time</li><li><strong>Wind:</strong> Fighting wind increases power consumption</li><li><strong>Age:</strong> Batteries degrade with charge cycles</li></ul><strong>Best practices:</strong> Always land with at least <strong>20% battery remaining</strong>. Monitor voltage during flight. Replace swollen or damaged batteries immediately.'
        },
        {
            keywords: ['performance factors', 'what affects performance', 'drone performance', 'flight performance'],
            topic: 'loading',
            answer: 'Factors affecting drone performance:<ul><li><strong>Density altitude</strong> (high/hot/humid = poor performance)</li><li><strong>Total weight</strong> (including payload)</li><li><strong>Wind speed and direction</strong></li><li><strong>Battery condition and temperature</strong></li><li><strong>Propeller condition</strong> (damaged props = reduced efficiency)</li><li><strong>Motor health</strong></li><li><strong>Altitude</strong> (higher = thinner air = less lift)</li></ul>Always plan your flight considering these factors and build in safety margins. Check manufacturer performance charts for your specific conditions.'
        },

        // --- OPERATIONS ---
        {
            keywords: ['imsafe', 'i\'m safe', 'preflight self', 'pilot fitness', 'self assessment', 'illness medication stress'],
            topic: 'operations',
            answer: 'The <strong>IMSAFE</strong> checklist is a pilot self-assessment tool:<ul><li><strong>I</strong>llness &ndash; Am I feeling ill or have any symptoms?</li><li><strong>M</strong>edication &ndash; Am I taking any medications that could impair judgment?</li><li><strong>S</strong>tress &ndash; Am I under psychological stress that could distract me?</li><li><strong>A</strong>lcohol &ndash; Have I consumed alcohol in the last 8 hours? Is my BAC below 0.04%?</li><li><strong>F</strong>atigue &ndash; Am I well-rested and alert?</li><li><strong>E</strong>ating &ndash; Have I eaten properly? Low blood sugar affects performance.</li></ul>Run through IMSAFE <strong>before every flight</strong>. If any item raises concern, don\'t fly.'
        },
        {
            keywords: ['pave', 'risk assessment', 'risk management', 'hazard assessment', 'pilot aircraft environment'],
            topic: 'operations',
            answer: 'The <strong>PAVE</strong> checklist helps assess risk for a planned flight:<ul><li><strong>P</strong>ilot &ndash; Am I current, proficient, and fit to fly? (Use IMSAFE)</li><li><strong>A</strong>ircraft &ndash; Is the drone airworthy? Batteries charged? Firmware updated?</li><li><strong>en<strong>V</strong></strong>ironment &ndash; Weather conditions? Airspace? Obstacles? TFRs?</li><li><strong>E</strong>xternal Pressures &ndash; Time pressure? Client expectations? "Get-there-itis"?</li></ul>Evaluate each element before every flight. External pressures are often the most dangerous because they push pilots to fly in marginal conditions.'
        },
        {
            keywords: ['3p model', 'perceive process perform', 'decision making', 'adm', 'aeronautical decision'],
            topic: 'operations',
            answer: 'The <strong>3P Model</strong> for Aeronautical Decision Making (ADM):<ol><li><strong>Perceive:</strong> Identify the hazards and current situation. What\'s happening?</li><li><strong>Process:</strong> Evaluate the level of risk. How serious is this? What could go wrong?</li><li><strong>Perform:</strong> Take action to mitigate the risk. What should I do about it?</li></ol>This is a <strong>continuous cycle</strong> throughout the flight, not just preflight. Constantly reassess as conditions change.<br><br>The goal of ADM is to reduce the likelihood of human error by providing structured decision-making tools.'
        },
        {
            keywords: ['preflight', 'pre-flight', 'inspection', 'preflight checklist', 'before flight', 'pre flight check'],
            topic: 'operations',
            answer: '<strong>Preflight inspection checklist:</strong><ol><li>Check weather (METARs, TAFs) and TFRs</li><li>Verify airspace authorization (LAANC/DroneZone) if needed</li><li>Perform IMSAFE self-assessment</li><li>Inspect airframe for damage or loose components</li><li>Check propellers for nicks, cracks, or balance issues</li><li>Verify battery charge and condition</li><li>Check GPS signal and compass calibration</li><li>Test control link and response</li><li>Verify failsafe/lost link procedures are set</li><li>Confirm Remote ID is broadcasting</li><li>Survey launch/landing area for hazards and obstacles</li><li>Brief visual observer and crew (if applicable)</li></ol>Under <strong>14 CFR 107.49</strong>, the remote PIC must ensure the sUAS is in safe operating condition before flight.'
        },
        {
            keywords: ['remote pic', 'pilot in command', 'pic responsibilities', 'pic duties', 'who is responsible'],
            topic: 'operations',
            answer: 'The <strong>Remote Pilot in Command (PIC)</strong> is <strong>ultimately responsible</strong> for the safe operation of the drone. Key responsibilities:<ul><li>Must <strong>hold a valid Remote Pilot Certificate</strong> or directly supervise someone who does not</li><li>Has <strong>final authority</strong> over the operation</li><li>Can <strong>delegate tasks</strong> (e.g., to a VO) but <strong>cannot delegate responsibility</strong></li><li>Must perform or supervise preflight inspection</li><li>Must ensure the operation complies with all Part 107 rules</li><li>Can only operate <strong>one drone at a time</strong></li><li>Must ensure the sUAS does not pose an <strong>undue hazard</strong> to persons or property</li></ul>'
        },
        {
            keywords: ['emergency', 'lost link', 'flyaway', 'emergency procedure', 'lost connection', 'failsafe'],
            topic: 'operations',
            answer: '<strong>Emergency procedures:</strong><br><br><strong>Lost Link:</strong> When the control connection is lost:<ul><li>Should have a <strong>pre-programmed failsafe</strong> (return to home, hover in place, or land immediately)</li><li>Establish lost link procedures <strong>before</strong> every flight</li><li>Know your drone\'s specific behavior on signal loss</li></ul><strong>Flyaway:</strong><ul><li>If the drone is not responding, try switching flight modes</li><li>Warn people in the area if the drone is uncontrollable</li><li>Report the incident if it results in injury or $500+ property damage</li></ul>Under <strong>14 CFR 107.21</strong>, the PIC may deviate from Part 107 rules to the extent necessary to respond to an <strong>in-flight emergency</strong>.'
        },
        {
            keywords: ['hyperventilation', 'spatial disorientation', 'fatigue', 'physiological', 'pilot health', 'human factors', 'vision'],
            topic: 'operations',
            answer: '<strong>Physiological factors</strong> affecting drone pilots:<ul><li><strong>Hyperventilation:</strong> Rapid breathing reducing CO2. Symptoms: tingling, dizziness, lightheadedness. Fix: slow your breathing, breathe into a bag.</li><li><strong>Spatial disorientation:</strong> Losing sense of the drone\'s position, especially at distance or in poor visibility.</li><li><strong>Fatigue:</strong> Reduces reaction time, impairs judgment, and decreases attention. Take breaks during long operations.</li><li><strong>Vision at night:</strong> Central vision is less effective in low light. Use <strong>off-center viewing</strong> (peripheral vision). Allow <strong>30 minutes for dark adaptation</strong>.</li><li><strong>Dehydration:</strong> Impairs cognitive function. Stay hydrated.</li></ul>'
        },
        {
            keywords: ['radio', 'communication', 'ctaf', 'airport operations', 'frequency', 'unicom'],
            topic: 'operations',
            answer: '<strong>Radio communications for drone pilots:</strong><br><br>While Part 107 does not require a radio, understanding aviation communications helps with situational awareness near airports:<ul><li><strong>CTAF (Common Traffic Advisory Frequency):</strong> Frequency used at non-towered airports for pilots to communicate their positions and intentions</li><li><strong>UNICOM:</strong> Advisory frequency at airports without towers</li><li><strong>ATIS (Automatic Terminal Information Service):</strong> Recorded weather and airport information, updated regularly</li></ul>If operating near an airport, monitoring the appropriate frequency can greatly enhance safety, though it is not required under Part 107.'
        },

        // --- EXAM TIPS ---
        {
            keywords: ['exam tips', 'test tips', 'study tips', 'how to pass', 'pass the exam', 'test strategy', 'exam advice', 'exam day'],
            topic: 'exam',
            answer: '<strong>Part 107 Exam Tips:</strong><ul><li><strong>Focus your study:</strong> Operations (35-45%) and Airspace/Regulations (15-25% each) are the biggest areas</li><li><strong>Master METAR reading:</strong> Almost guaranteed to have METAR questions</li><li><strong>Know the numbers:</strong> 400 ft, 87 knots, 55 lbs, 3 SM, 0.55 lbs, 16 years, 10 days, $500, 8 hours, 0.04% BAC</li><li><strong>Watch for trick words:</strong> "always," "never," "must" vs "should"</li><li><strong>Use process of elimination:</strong> Eliminate obviously wrong answers first</li><li><strong>Flag and return:</strong> Don\'t spend too long on tough questions</li><li><strong>Bring:</strong> Government photo ID, basic calculator allowed</li><li><strong>Format:</strong> 60 questions, 120 minutes, 70% (42/60) to pass, ~$175</li></ul>'
        },
        {
            keywords: ['what to study', 'study plan', 'study schedule', 'how to prepare', 'preparation', 'study order', 'where to start'],
            topic: 'exam',
            answer: '<strong>Recommended study plan:</strong><ol><li><strong>Start with Regulations</strong> &ndash; the foundation for everything else. Know the key numbers and rules.</li><li><strong>Learn Airspace</strong> &ndash; critical for knowing where you can fly. Practice reading sectional charts.</li><li><strong>Study Operations</strong> &ndash; the largest exam section. Focus on ADM, IMSAFE, preflight, and crew roles.</li><li><strong>Cover Weather</strong> &ndash; master METAR/TAF decoding and density altitude.</li><li><strong>Review Loading & Performance</strong> &ndash; smallest section but easy points.</li><li><strong>Take practice exams</strong> &ndash; simulate test conditions with the <a href="practice-exam.html">Practice Exam</a>.</li></ol>Use our <a href="flashcards.html">Flashcards</a> for quick review and the <a href="reference.html">Quick Reference</a> sheet for last-minute cramming.'
        },

        // --- GENERAL / GETTING STARTED ---
        {
            keywords: ['hello', 'hi', 'hey', 'help', 'what can you do', 'how does this work', 'start'],
            topic: 'general',
            answer: 'Welcome! I\'m your <strong>Part 107 Study Assistant</strong>. I can help you with any topic related to the FAA Part 107 drone pilot exam.<br><br>Try asking me about:<ul><li>Specific regulations (altitude, speed, weight limits)</li><li>Airspace classes and sectional chart reading</li><li>Weather concepts (METARs, TAFs, density altitude)</li><li>Loading &amp; performance factors</li><li>Operations (preflight, ADM, night ops, Remote ID)</li><li>Exam tips and study strategies</li></ul>Just type your question below or click one of the suggested topics!'
        },
        {
            keywords: ['thanks', 'thank you', 'thx', 'appreciate', 'great', 'awesome', 'perfect'],
            topic: 'general',
            answer: 'You\'re welcome! Keep studying and you\'ll ace the Part 107 exam. Feel free to ask me anything else &mdash; I\'m here to help you pass!'
        }
    ];

    // =========================================
    // Topic-based suggestions
    // =========================================
    var SUGGESTIONS = {
        initial: [
            'What is Part 107?',
            'Airspace classes',
            'How to read METARs',
            'Exam tips'
        ],
        regulations: [
            'Night flying rules',
            'Operations over people',
            'Remote ID',
            'Waivers'
        ],
        airspace: [
            'Class B airspace',
            'Class G airspace',
            'LAANC authorization',
            'TFRs'
        ],
        weather: [
            'Density altitude',
            'Thunderstorms',
            'TAF format',
            'Fog & dew point'
        ],
        loading: [
            'Center of gravity',
            'Battery performance',
            'Overloading effects',
            'Weight limits'
        ],
        operations: [
            'IMSAFE checklist',
            'PAVE risk assessment',
            'Preflight inspection',
            'Emergency procedures'
        ]
    };

    // =========================================
    // Chat engine
    // =========================================
    var chatOpen = false;
    var messages = [];
    var lastTopic = 'initial';

    function findBestMatch(input) {
        var lower = input.toLowerCase().replace(/[?!.,]/g, '');
        var tokens = lower.split(/\s+/);
        var best = null;
        var bestScore = 0;

        for (var i = 0; i < KB.length; i++) {
            var entry = KB[i];
            var score = 0;

            for (var j = 0; j < entry.keywords.length; j++) {
                var kw = entry.keywords[j].toLowerCase();

                // Exact phrase match (highest value)
                if (lower.indexOf(kw) !== -1) {
                    // Score based on keyword length (longer = more specific = better)
                    score += 10 + kw.length;
                } else {
                    // Partial token match
                    var kwTokens = kw.split(/\s+/);
                    var tokenMatches = 0;
                    for (var k = 0; k < kwTokens.length; k++) {
                        for (var t = 0; t < tokens.length; t++) {
                            if (tokens[t].indexOf(kwTokens[k]) !== -1 || kwTokens[k].indexOf(tokens[t]) !== -1) {
                                tokenMatches++;
                                break;
                            }
                        }
                    }
                    if (tokenMatches > 0) {
                        score += tokenMatches * 3;
                    }
                }
            }

            if (score > bestScore) {
                bestScore = score;
                best = entry;
            }
        }

        // Require a minimum match score
        if (bestScore < 3) return null;
        return best;
    }

    function getResponse(input) {
        var match = findBestMatch(input);
        if (match) {
            lastTopic = match.topic;
            return match.answer;
        }

        // Fallback
        return 'I\'m not sure about that specific question, but I can help with these Part 107 topics:<ul>' +
            '<li><strong>Regulations</strong> &ndash; altitude, speed, weight, certification rules</li>' +
            '<li><strong>Airspace</strong> &ndash; classes A&ndash;G, chart reading, LAANC</li>' +
            '<li><strong>Weather</strong> &ndash; METARs, TAFs, density altitude, thunderstorms</li>' +
            '<li><strong>Loading &amp; Performance</strong> &ndash; CG, battery, payload effects</li>' +
            '<li><strong>Operations</strong> &ndash; preflight, ADM, night ops, crew roles, Remote ID</li>' +
            '</ul>Try rephrasing your question or click one of the suggested topics below!';
    }

    // =========================================
    // UI rendering
    // =========================================
    function injectChatWidget() {
        // Determine base path (for chapter pages the path is different)
        var isSubDir = window.location.pathname.indexOf('/chapters/') !== -1;
        var prefix = isSubDir ? '../' : '';

        // FAB button
        var fab = document.createElement('button');
        fab.className = 'chat-fab';
        fab.id = 'chatFab';
        fab.setAttribute('aria-label', 'Open study assistant');
        fab.innerHTML = '<span class="fab-icon">&#x1F393;</span><span class="fab-close">&times;</span>';

        // Chat window
        var win = document.createElement('div');
        win.className = 'chat-window';
        win.id = 'chatWindow';
        win.innerHTML =
            '<div class="chat-header">' +
                '<div class="chat-header-icon">&#x1F393;</div>' +
                '<div class="chat-header-text">' +
                    '<h4>Part 107 Study Assistant</h4>' +
                    '<span>Ask me anything about the exam</span>' +
                '</div>' +
            '</div>' +
            '<div class="chat-messages" id="chatMessages"></div>' +
            '<div class="chat-suggestions" id="chatSuggestions"></div>' +
            '<div class="chat-input-area">' +
                '<input type="text" class="chat-input" id="chatInput" placeholder="Ask a question..." autocomplete="off">' +
                '<button class="chat-send" id="chatSend" aria-label="Send">&#10148;</button>' +
            '</div>';

        document.body.appendChild(fab);
        document.body.appendChild(win);

        // Event listeners
        fab.addEventListener('click', toggleChat);
        document.getElementById('chatSend').addEventListener('click', handleSend);
        document.getElementById('chatInput').addEventListener('keydown', function (e) {
            if (e.key === 'Enter') handleSend();
        });

        // Show initial message
        addBotMessage('Hi! I\'m your <strong>Part 107 Study Assistant</strong>. Ask me anything about the FAA drone pilot exam &mdash; regulations, airspace, weather, operations, or study tips. How can I help?');
        showSuggestions('initial');

        // Detect current chapter page context and show relevant suggestions
        var path = window.location.pathname.toLowerCase();
        if (path.indexOf('regulations') !== -1) lastTopic = 'regulations';
        else if (path.indexOf('airspace') !== -1) lastTopic = 'airspace';
        else if (path.indexOf('weather') !== -1) lastTopic = 'weather';
        else if (path.indexOf('loading') !== -1) lastTopic = 'loading';
        else if (path.indexOf('operations') !== -1) lastTopic = 'operations';
    }

    function toggleChat() {
        chatOpen = !chatOpen;
        var fab = document.getElementById('chatFab');
        var win = document.getElementById('chatWindow');
        fab.classList.toggle('open', chatOpen);
        win.classList.toggle('open', chatOpen);
        if (chatOpen) {
            document.getElementById('chatInput').focus();
        }
    }

    function addBotMessage(html) {
        var msgs = document.getElementById('chatMessages');
        var msg = document.createElement('div');
        msg.className = 'chat-msg bot';
        msg.innerHTML = html;
        msgs.appendChild(msg);
        msgs.scrollTop = msgs.scrollHeight;
        messages.push({ role: 'bot', content: html });
    }

    function addUserMessage(text) {
        var msgs = document.getElementById('chatMessages');
        var msg = document.createElement('div');
        msg.className = 'chat-msg user';
        msg.textContent = text;
        msgs.appendChild(msg);
        msgs.scrollTop = msgs.scrollHeight;
        messages.push({ role: 'user', content: text });
    }

    function showTyping() {
        var msgs = document.getElementById('chatMessages');
        var typing = document.createElement('div');
        typing.className = 'chat-typing';
        typing.id = 'chatTyping';
        typing.innerHTML = '<span></span><span></span><span></span>';
        msgs.appendChild(typing);
        msgs.scrollTop = msgs.scrollHeight;
    }

    function hideTyping() {
        var typing = document.getElementById('chatTyping');
        if (typing) typing.remove();
    }

    function showSuggestions(topic) {
        var container = document.getElementById('chatSuggestions');
        var suggestions = SUGGESTIONS[topic] || SUGGESTIONS.initial;
        container.innerHTML = '';
        container.classList.remove('hidden');
        suggestions.forEach(function (text) {
            var chip = document.createElement('button');
            chip.className = 'suggest-chip';
            chip.textContent = text;
            chip.addEventListener('click', function () {
                document.getElementById('chatInput').value = text;
                handleSend();
            });
            container.appendChild(chip);
        });
    }

    function handleSend() {
        var input = document.getElementById('chatInput');
        var text = input.value.trim();
        if (!text) return;

        input.value = '';
        addUserMessage(text);

        // Hide suggestions during response
        document.getElementById('chatSuggestions').classList.add('hidden');

        // Simulate typing delay for natural feel
        showTyping();
        var delay = 400 + Math.random() * 600;
        setTimeout(function () {
            hideTyping();
            var response = getResponse(text);
            addBotMessage(response);
            // Show new suggestions based on detected topic
            showSuggestions(lastTopic);
        }, delay);
    }

    // =========================================
    // Initialize on DOM ready
    // =========================================
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', injectChatWidget);
    } else {
        injectChatWidget();
    }
})();
