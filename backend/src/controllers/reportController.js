const { supabase } = require("../config/supabase");

const getReports = async (req, res) => {
  try {
    const userId = req.auth?.userId || req.auth?.claims?.sub;
    const { data, error } = await supabase
      .from("analysis_reports")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error("History API Error:", error);
    res.status(500).json({ error: "Failed to fetch reports history" });
  }
};

const deleteReports = async (req, res) => {
  try {
    const userId = req.auth?.userId || req.auth?.claims?.sub;
    const { error } = await supabase
      .from("analysis_reports")
      .delete()
      .eq("user_id", userId);

    if (error) throw error;
    res.json({ message: "Success" });
  } catch (error) {
    console.error("Delete History Error:", error);
    res.status(500).json({ error: "Failed to delete reports history" });
  }
};

const getReportById = async (req, res) => {
  try {
    const userId = req.auth?.userId || req.auth?.claims?.sub;
    const { id } = req.params;
    const { data, error } = await supabase
      .from("analysis_reports")
      .select("*")
      .eq("id", id)
      .eq("user_id", userId)
      .single();

    if (error) throw error;
    res.json({ report: data });
  } catch (error) {
    console.error("Get Report Error:", error);
    res.status(404).json({ error: "Report not found" });
  }
};

const deleteReportById = async (req, res) => {
  try {
    const userId = req.auth?.userId || req.auth?.claims?.sub;
    const { id } = req.params;
    const { error } = await supabase
      .from("analysis_reports")
      .delete()
      .eq("id", id)
      .eq("user_id", userId);

    if (error) throw error;
    res.json({ message: "Success" });
  } catch (error) {
    console.error("Delete Report Error:", error);
    res.status(500).json({ error: "Failed to delete report" });
  }
};

module.exports = {
  getReports,
  deleteReports,
  getReportById,
  deleteReportById,
};
