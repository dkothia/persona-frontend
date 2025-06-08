import React, { useState } from "react";
import * as XLSX from "xlsx";

const BASE_URL = "http://persona-env.eba-zvh5ukvu.us-west-2.elasticbeanstalk.com";

const styles = {
  container: {
    fontFamily: "'San Francisco', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
    maxWidth: "900px",
    margin: "0 auto",
    padding: "40px",
    backgroundColor: "#ffffff",
    borderRadius: "12px",
    boxShadow: "0 10px 30px rgba(0, 0, 0, 0.1)",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "40px",
  },
  titleText: {
    fontSize: "32px",
    fontWeight: "600",
    color: "#333333",
    letterSpacing: "0.5px",
  },
  navLinks: {
    display: "flex",
    gap: "20px",
    fontSize: "16px",
    fontWeight: "500",
    color: "#555555",
    cursor: "pointer",
  },
  loginButton: {
    padding: "12px 24px",
    fontSize: "16px",
    color: "#ffffff",
    backgroundColor: "#007aff",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    transition: "background-color 0.3s ease",
    boxShadow: "0 4px 12px rgba(0, 122, 255, 0.3)",
  },
  loginButtonHover: {
    backgroundColor: "#0056b3",
  },
  centerSection: {
    backgroundColor: "#f9f9f9",
    padding: "30px",
    borderRadius: "12px",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)",
  },
  textarea: {
    width: "100%",
    height: "120px",
    padding: "12px",
    fontSize: "16px",
    border: "1px solid #e0e0e0",
    borderRadius: "8px",
    marginBottom: "20px",
    resize: "none",
    transition: "border-color 0.3s ease, box-shadow 0.3s ease",
  },
  textareaFocus: {
    borderColor: "#007aff",
    boxShadow: "0 0 8px rgba(0, 122, 255, 0.3)",
  },
  button: {
    padding: "12px 24px",
    fontSize: "16px",
    color: "#ffffff",
    backgroundColor: "#007aff",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    transition: "background-color 0.3s ease, box-shadow 0.3s ease",
    boxShadow: "0 4px 12px rgba(0, 122, 255, 0.3)",
  },
  buttonDisabled: {
    backgroundColor: "#cccccc",
    cursor: "not-allowed",
    boxShadow: "none",
  },
  buttonHover: {
    backgroundColor: "#0056b3",
  },
  fileUpload: {
    margin: "20px 0",
    fontSize: "16px",
    color: "#555555",
  },
  errorText: {
    color: "#ff3b30",
    fontSize: "14px",
    marginBottom: "20px",
  },
  resultBox: {
    backgroundColor: "#e8f4ff",
    padding: "20px",
    borderRadius: "8px",
    marginBottom: "20px",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)",
    fontSize: "16px",
    color: "#333333",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    marginBottom: "20px",
    fontSize: "16px",
    color: "#333333",
  },
  thtd: {
    border: "1px solid #e0e0e0",
    padding: "12px",
    textAlign: "left",
  },
  th: {
    backgroundColor: "#007aff",
    color: "#ffffff",
    fontWeight: "600",
    textAlign: "left",
    padding: "12px",
  },
  downloadButton: {
    padding: "12px 24px",
    fontSize: "16px",
    color: "#ffffff",
    backgroundColor: "#007aff",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    transition: "background-color 0.3s ease, box-shadow 0.3s ease",
    boxShadow: "0 4px 12px rgba(0, 122, 255, 0.3)",
  },
  downloadButtonHover: {
    backgroundColor: "#0056b3",
  },
};

export default function App() {
  const [inputText, setInputText] = useState("");
  const [personaResult, setPersonaResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isFocused, setIsFocused] = useState(false);
  const [tableData, setTableData] = useState([]);

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    setPersonaResult("");
    try {
      const response = await fetch(`${BASE_URL}/generate-persona`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: inputText }),
      });
      if (!response.ok) throw new Error("API error");
      const data = await response.json();
      setPersonaResult(data.persona);
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e) => {
    const uploadedFile = e.target.files[0];
    if (!uploadedFile) return;

    const validTypes = [
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.ms-excel",
      "text/csv",
    ];
    if (!validTypes.includes(uploadedFile.type)) {
      setError("Invalid file type. Please upload a CSV or Excel file.");
      return;
    }

    if (uploadedFile.size === 0) {
      setError("The uploaded file is empty. Please upload a valid file.");
      return;
    }

    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append("file", uploadedFile);

    try {
      const response = await fetch(`${BASE_URL}/generate-personas-batch-csv`, {
        method: "POST",
        body: formData,
      });
      if (!response.ok) throw new Error("Batch API error");
      const resultData = await response.json();

      if (!resultData || resultData.length === 0) {
        throw new Error("No data found in the uploaded file.");
      }

      setTableData(resultData.data); // Update tableData state
      console.log("Table Data:", resultData.data); // Debug the state
      alert("File processed successfully! Check the table below for results.");
    } catch (error) {
      setError(error.message || "Something went wrong during batch upload");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    const worksheet = XLSX.utils.json_to_sheet(tableData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Personas");
    XLSX.writeFile(workbook, "persona_results.xlsx");
  };

  const handleSubmitOrBatch = async () => {
    const reviews = inputText
      .split("\n")
      .map((review) => review.trim())
      .filter((review) => review !== "");
    const isMultipleReviews = reviews.length > 1;

    if (isMultipleReviews) {
      await handleSubmitBatch(reviews);
    } else {
      await handleSubmit();
    }
  };

  const handleSubmitBatch = async (reviews) => {
    setLoading(true);
    setError(null);
    setTableData([]);

    try {
      const formattedReviews = reviews.map((review, index) => ({
        customer_id: `CUST${index + 1}`,
        review: review,
      }));

      console.log("Payload Sent to Backend:", JSON.stringify({ data: formattedReviews }));

      const response = await fetch(`${BASE_URL}/generate-personas-batch`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ data: formattedReviews }),
      });

      if (!response.ok) throw new Error("Batch API error");
      const resultData = await response.json();

      console.log("Backend Response:", resultData); // Debug response
      setTableData(resultData.data); // Update tableData state
      alert("Personas generated successfully! Check the table below for results.");
    } catch (err) {
      console.error("Error:", err.message);
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  console.log(
    "Rendering Condition:",
    tableData.length > 0 &&
      tableData[0]["Customer ID"] &&
      tableData[0]["Review"] &&
      tableData[0]["Persona"]
  );

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.titleText}>Persona Forge</h1>
        <div style={styles.navLinks}>
          <span>Pricing</span>
          <span>Institutions</span>
          <span>About</span>
          <span>Blog</span>
        </div>
        <button
          style={styles.loginButton}
          onMouseEnter={(e) =>
            (e.target.style.backgroundColor = styles.loginButtonHover.backgroundColor)
          }
          onMouseLeave={(e) =>
            (e.target.style.backgroundColor = styles.loginButton.backgroundColor)
          }
        >
          Login
        </button>
      </div>

      <div style={styles.centerSection}>
        <textarea
          style={isFocused ? { ...styles.textarea, ...styles.textareaFocus } : styles.textarea}
          placeholder="Paste your customer review here..."
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          disabled={loading}
        />
        <button
          style={loading || !inputText ? { ...styles.button, ...styles.buttonDisabled } : styles.button}
          onClick={handleSubmitOrBatch}
          disabled={loading || !inputText}
          onMouseEnter={(e) =>
            (e.target.style.backgroundColor = styles.buttonHover.backgroundColor)
          }
          onMouseLeave={(e) =>
            (e.target.style.backgroundColor = styles.button.backgroundColor)
          }
        >
          {loading ? "Generating Personas…" : "Generate Personas"}
        </button>

        <div style={styles.fileUpload}>
          <input
            type="file"
            onChange={handleFileUpload}
            accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
            disabled={loading}
          />
        </div>

        {error && <p style={styles.errorText}>{error}</p>}
        {personaResult && <div style={styles.resultBox}>{personaResult}</div>}

        {tableData.length > 0 &&
          tableData[0]["Customer ID"] &&
          tableData[0]["Review"] &&
          tableData[0]["Persona"] && (
            <>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={{ ...styles.thtd, ...styles.th }}>Customer ID</th>
                    <th style={{ ...styles.thtd, ...styles.th }}>Review</th>
                    <th style={{ ...styles.thtd, ...styles.th }}>Generated Persona</th>
                  </tr>
                </thead>
                <tbody>
                  {tableData.map((row, i) => (
                    <tr key={i}>
                      <td style={styles.thtd}>{row["Customer ID"]}</td>
                      <td style={styles.thtd}>{row["Review"]}</td>
                      <td style={styles.thtd}>{row["Persona"]}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <button
                style={styles.downloadButton}
                onClick={handleDownload}
                onMouseEnter={(e) =>
                  (e.target.style.backgroundColor = styles.downloadButtonHover.backgroundColor)
                }
                onMouseLeave={(e) =>
                  (e.target.style.backgroundColor = styles.downloadButton.backgroundColor)
                }
              >
                Download Results
              </button>
            </>
          )}
      </div>
    </div>
  );
}