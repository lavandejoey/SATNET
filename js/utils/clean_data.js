import "/node_modules/d3/dist/d3.min.js";

// 1. load tsv file "data/launchlog.tsv"
const launchLog = d3.dsv("\t", "data/launchlog.tsv").then(data => {
    console.log(data.columns);
    // "#Launch_Tag", "Launch_Date", "Piece", "Type", "Name", "PLName", "JCAT", "SatOwner",
    // "SatState", "LV_Type", "Flight_ID", "Platform", "Launch_Site", "Launch_Pad", "Ascent_Site",
    // "Ascent_Pad", "Agency", "LVState", "Launch_Code", "LTCite"

    // 2. clean data
    data.filter(
        // remove if Launch_Date is null or empty or undefined
        d => d["Launch_Date"] && d["Launch_Date"].length > 0
    );
    data.forEach(d => {
        d.IntlLaunchCode = d["#Launch_Tag"];
        // parse date str -> date obj
        d.LaunchDate = (new Date(d["Launch_Date"].slice(0, 10)));
        d.IntlObjCode = d["Piece"];
        // to a list of strings, slice by \s+
        d.Type = d["Type"].split(/\s+/);
        d.Name = d["Name"];
        d.PLName = d["PLName"];
        // d.JCAT = d["JCAT"];
        // d.SatOwner = d["SatOwner"];
        d.SatState = d["SatState"];
        // d.LVType = d["LV_Type"]; // LV_Type: Launch Vehicle Type
        // d.FlightID = d["Flight_ID"];
        // d.Platform = d["Platform"];
        d.LaunchSite = d["Launch_Site"];
        // d.LaunchPad = d["Launch_Pad"];
        // d.AscentSite = d["Ascent_Site"];
        // d.AscentPad = d["Ascent_Pad"];
        d.Agency = d["Agency"];
        d.LVState = d["LVState"];
        d.LaunchCode = d["Launch_Code"];
        d.LTCite = d["LTCite"];
    });
    console.log(data[0]);

    return data;
});