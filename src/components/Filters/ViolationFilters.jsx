// these are the filters for violations based on type, severity, date range, etc.
import { useState } from "react";
import "./filters.css";

// creating filter conditions
const YEARS = [2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023];

const STATUSES = [
  "CANCELLED", "CLOSED", "COMPLIED, BALANCE DUE", "IN VIOLATION",
  "IN VIOLATION - COURT", "STOP WORK", "SVN ISSUED, BALANCE DUE",
  "UNDER INVESTIGATION", "UNSPECIFIED (no status)",
];

const INSPECTDIST = ["NORTH", "CENTRAL EAST", "EAST", "SOUTH", "CENTRAL WEST"];
const RESOLUTIONCODE = [
  "CLOSED - ADMINISTRATIVELY", "CLOSED - APPEAL SUSTAINED", "CLOSED - REISSUED/REWRITTEN",
  "CLOSED - STOP PROCESSING", "CLOSED - WRITTEN IN ERROR", "COMPLIED - BY ENFORCEMENT ACTION",
  "COMPLIED - LICENSE/CERTIFICATE/REPORT OBTAINED", "COMPLIED - OWNER DEMOLITION",
  "COMPLIED - PERMIT OBTAINED", "COMPLIED - VARIANCE GRANTED", "CVN ISSUED",
  "SVN ISSUED", "WARNING ISSUED", "UNRESOLVED (no status)",
];

const PRIORITY = [
  "5 DAY REVIEW GROUP", "ACCELERATED REVIEW", "AIU LICENSING VIOLATION NOTICE",
  "CONSTRUCTION SERVICES", "STANDARD", "UNFIT", "UNLAWFUL",
  "UNSAFE", "HAZARDOUS", "IMMINENTLY DANGEROUS", "UNSPECIFIED (no status)",
];


const toggleValue = (current = [], value) =>
  current.includes(value) ? current.filter((v) => v !== value) : [...current, value];

export default function ViolationFilters({ filters, setFilters, summary = {} }) {
  const vf = filters.violationFilters;
  const [openSections, setOpenSections] = useState({
    YEARS: true,
    STATUSES: true,
    INSPECTDIST: true,
    RESOLUTIONCODE: true,
    PRIORITY: true,
  });

  const updateField = (field, value) => {
    setFilters((prev) => ({
      ...prev,
      violationFilters: {
        ...prev.violationFilters,
        [field]: toggleValue(prev.violationFilters[field], value),
      },
    }));
  };

  const toggleSection = (field) => {
    setOpenSections((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const checkboxGroup = (label, values, field) => {
    const isOpen = openSections[field];
    return (
      <div className={`filter-group ${isOpen ? "is-open" : "is-collapsed"}`} key={field}>
        <button
          type="button"
          className="filter-group-toggle"
          onClick={() => toggleSection(field)}
          aria-expanded={isOpen}
        >
          <span>{label}</span>
          <span className="chevron">{isOpen ? "−" : "+"}</span>
        </button>
        {isOpen && (
          <div className="filter-options">
            {values.map((v) => (
              <label className="filter-option" key={v}>
                <input
                  type="checkbox"
                  checked={vf[field]?.includes(v) || false}
                  onChange={() => updateField(field, v)}
                />
                <span>{v}</span>
              </label>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="filter-panel">
      <header className="filter-header">
        <div>
          <h3>Code Violations</h3>
          <p>Select any combination of filters to highlight overlapping conditions.</p>
        </div>
        <button
          className="filter-clear"
          type="button"
          onClick={() =>
            setFilters((prev) => ({
              ...prev,
              violationFilters: {
                YEARS: [],
                STATUSES: [],
                INSPECTDIST: [],
                RESOLUTIONCODE: [],
                PRIORITY: [],
                COUNCILDIST: prev.violationFilters.COUNCILDIST ?? null,
              },
            }))
          }
        >
          Clear All
        </button>
      </header>

      <div className="filter-groups">
        {checkboxGroup("Year Filed", YEARS, "YEARS")}
        {checkboxGroup("Case Status", STATUSES, "STATUSES")}
        {checkboxGroup("L&I Inspection District", INSPECTDIST, "INSPECTDIST")}
        {checkboxGroup("Resolution Code", RESOLUTIONCODE, "RESOLUTIONCODE")}
        {checkboxGroup("Priority", PRIORITY, "PRIORITY")}
      </div>

      <div className="violation-summary">
        <h4>Selected totals</h4>
        {Object.keys(summary).length === 0 && (
          <div className="summary-row muted">No filters selected</div>
        )}
        {Object.entries(summary).map(([key, entries]) => (
          <div key={key} className="summary-section">
            <strong>{key}</strong>
            {entries.map(({ value, count }) => (
              <div key={`${key}-${value}`} className="summary-row">
                <span>{value || "N/A"}</span>
                <span className="summary-count">{count.toLocaleString()}</span>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

// // toggle behavior for check boxes
// const toggleValue = (current = [], value) =>
//   current.includes(value) ? current.filter((v) => v !== value) : [...current, value];


// // main export function
// export default function ViolationFilters({ filters, setFilters, summary = {} }) {
//   const vf = filters.violationFilters;


//   // update call for checkboxes
//     const updateField = (field, value) => {
//     setFilters((prev) => ({
//       ...prev,
//       violationFilters: {
//         ...prev.violationFilters,
//         [field]: toggleValue(prev.violationFilters[field], value),
//       },
//     }));
//   };

//   const checkboxGroup = (label, values, field) => (
//   <div className="filter-group">
//     <div className="filter-label">{label}</div>
//     <div className="filter-options">
//       {values.map((v) => (
//         <label key={v}>
//           <input
//             type="checkbox"
//             checked={vf[field]?.includes(v) || false}
//             onChange={() => updateField(field, v)}
//           />
//           {v}
//         </label>
//       ))}
//     </div>
//   </div>
// );


// return (
//     <div className="filter-panel">
//       <h3>Code violations</h3>
//       {checkboxGroup("Year Filed", YEARS, "YEARS")}
//       {checkboxGroup("Case Status", STATUSES, "STATUSES")}
//       {checkboxGroup("L&I Inspection District", INSPECTDIST, "INSPECTDIST")}
//       {checkboxGroup("Resolution Code", RESOLUTIONCODE, "RESOLUTIONCODE")}
//       {checkboxGroup("Priority", PRIORITY, "PRIORITY")}

//       <div className="violation-summary">
//         <h4>Selected totals</h4>
//         {Object.keys(summary).length === 0 && (
//           <div className="summary-row">No filters selected</div>
//         )}
//         {Object.entries(summary).map(([key, entries]) => (
//           <div key={key} className="summary-section">
//             <strong>{key}</strong>
//             {entries.map(({ value, count }) => (
//               <div key={`${key}-${value}`} className="summary-row">
//                 {value || "N/A"}: {count.toLocaleString()}
//               </div>
//             ))}
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// }


//   // // YEARS -> filters.violationFilters.YEARS
//   // const handleYearChange = (e) => {
//   //   const value = e.target.value ? Number(e.target.value) : null;
//   //   setFilters((prev) => ({
//   //     ...prev,
//   //     violationFilters: {
//   //       ...prev.violationFilters,
//   //       YEARS: value,
//   //     },
//   //   }));
//   //   };

//   // // STATUSES -> filters.violationFilters.STATUSES (array)
//   // const handleStatusChange = (status) => {
//   //   setFilters((prev) => {
//   //     const current = prev.violationFilters.STATUSES || [];
//   //     const exists = current.includes(status);
//   //     const updated = exists
//   //       ? current.filter((s) => s !== status)
//   //       : [...current, status];

//   //     return {
//   //       ...prev,
//   //       violationFilters: {
//   //         ...prev.violationFilters,
//   //         STATUSES: updated,
//   //       },
//   //     };
//   //   });
//   // };

//   // // INSPECTDIST -> filters.violationFilters.INSPECTDIST
//   // const handleInspectDistChange = (e) => {
//   //   const value = e.target.value || null;
//   //   setFilters((prev) => ({
//   //     ...prev,
//   //     violationFilters: {
//   //       ...prev.violationFilters,
//   //       INSPECTDIST: value,
//   //     },
//   //   }));
//   // };

//   // // RESOLUTIONCODE -> filters.violationFilters.RESOLUTIONCODE
//   // const handleResolutionCodeChange = (e) => {
//   //   const value = e.target.value || null;
//   //   setFilters((prev) => ({
//   //     ...prev,
//   //     violationFilters: {
//   //       ...prev.violationFilters,
//   //       RESOLUTIONCODE: value,
//   //     },
//   //   }));
//   // };

//   // // PRIORITY -> filters.violationFilters.PRIORITY
//   // const handlePriorityChange = (e) => {
//   //   const value = e.target.value || null;
//   //   setFilters((prev) => ({
//   //     ...prev,
//   //     violationFilters: {
//   //       ...prev.violationFilters,
//   //       PRIORITY: value,
//   //     },
//   //   }));
//   // };

// //   return (
// //     <div className="filter-panel">
// //       <h3>Code violations</h3>

      
// //       {/* Year Checkboxes */}
// //         <div style={{ marginTop: 8 }}>
// //           <div>Year Filed:</div>
// //           {YEARS.map((s) => (
// //             <label key={s} style={{ marginRight: 8 }}>
// //               <input
// //                 type="checkbox"
// //                 checked={vf.YEARS?.includes(s) || false}
// //                 onChange={() => handleYearChange(s)}
// //               />
// //               {s}
// //             </label>
// //           ))}
// //         </div>

// //       {/* Status checkboxes */}
// //       <div style={{ marginTop: 8 }}>
// //         <div>Violation Status:</div>
// //         {STATUSES.map((s) => (
// //           <label key={s} style={{ marginRight: 8 }}>
// //             <input
// //               type="checkbox"
// //               checked={vf.STATUSES?.includes(s) || false}
// //               onChange={() => handleStatusChange(s)}
// //             />
// //             {s}
// //           </label>
// //         ))}
// //       </div>

// //       {/* L&I Inspection District Checkboxes */}
// //       <div style={{ marginTop: 8 }}>
// //         <div>L&I Inspection District:</div>
// //         {INSPECTDIST.map((s) => (
// //           <label key={s} style={{ marginRight: 8 }}>
// //             <input
// //               type="checkbox"
// //               checked={vf.INSPECTDIST?.includes(s) || false}
// //               onChange={() => handleInspectDistChange(s)}
// //             />
// //             {s}
// //           </label>
// //         ))}
// //       </div>

// //       {/* Violation Resolution Code Checkboxes */}
// //       <div style={{ marginTop: 8 }}>
// //         <div>Violation Resolution Code:</div>
// //         {RESOLUTIONCODE.map((s) => (
// //           <label key={s} style={{ marginRight: 8 }}>
// //             <input
// //               type="checkbox"
// //               checked={vf.RESOLUTIONCODE?.includes(s) || false}
// //               onChange={() => handleResolutionCodeChange(s)}
// //             />
// //             {s}
// //           </label>
// //         ))}
// //       </div>

// //       {/* Priority Checkboxes */}
// //       <div style={{ marginTop: 8 }}>
// //         <div>Violation Status:</div>
// //         {PRIORITY.map((s) => (
// //           <label key={s} style={{ marginRight: 8 }}>
// //             <input
// //               type="checkbox"
// //               checked={vf.PRIORITY?.includes(s) || false}
// //               onChange={() => handlePriorityChange(s)}
// //             />
// //             {s}
// //           </label>
// //         ))}
// //       </div>

// //     </div>
// //   );
// // }

// // <div className="violation-summary">
// //   <h4>Selected totals</h4>
// //   {Object.keys(summary).length === 0 && <div>No filters selected</div>}
// //   {Object.entries(summary).map(([field, entries]) => (
// //     <div key={field}>
// //       <strong>{field}</strong>
// //       {entries.map(({ value, count }) => (
// //         <div key={`${field}-${value}`}>
// //           {value || "N/A"}: {count.toLocaleString()}
// //         </div>
// //       ))}
// //     </div>
// //   ))}
// // </div>
