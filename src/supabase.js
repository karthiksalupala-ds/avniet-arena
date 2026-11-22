// ==============================================================
// AVNIET ARENA — SUPABASE POSTGRESQL & REALTIME INTEGRATION
// Handles enterprise database persistence, connection pooling,
// and real-time event broadcasting to the Admin Console.
// ==============================================================

const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

let supabase = null;

if (SUPABASE_URL && SUPABASE_ANON_KEY && SUPABASE_URL.includes('supabase.co')) {
  try {
    supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: { persistSession: false }
    });
    console.log("⚡ [Supabase] Connected to PostgreSQL Cloud Database:", SUPABASE_URL);
  } catch (err) {
    console.warn("⚠️ [Supabase] Client initialization warning:", err.message);
  }
} else {
  console.log("ℹ️ [Supabase] Keys not provided in .env yet. Running in high-speed local queue mode.");
}

const SupabaseService = {
  isConnected() {
    return supabase !== null;
  },

  getClient() {
    return supabase;
  },

  // Insert candidate submission to Supabase
  async saveSubmission(record) {
    if (!supabase) return null;
    try {
      const payload = {
        submission_id: record.submissionId,
        exam_id: record.examId || "EXAM-AVN-2026-APT",
        roll: record.roll,
        name: record.name || null,
        branch: record.branch || "CSE",
        batch: record.batch || "2028",
        score: record.score,
        accuracy: record.accuracy,
        time_taken: record.time,
        trust_score: record.trust,
        tab_switches: record.tabs,
        status: record.status
      };

      const { data, error } = await supabase
        .from('submissions')
        .insert([payload])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (err) {
      console.warn("⚠️ [Supabase DB write warning]:", err.message);
      return null;
    }
  },

  // Query submissions with filtering
  async getSubmissions(filter = {}) {
    if (!supabase) return null;
    try {
      let query = supabase.from('submissions').select('*').order('created_at', { ascending: false });

      if (filter.examId && filter.examId !== 'ALL') query = query.eq('exam_id', filter.examId);
      if (filter.branch && filter.branch !== 'ALL') query = query.eq('branch', filter.branch);
      if (filter.batch && filter.batch !== 'ALL') query = query.eq('batch', filter.batch);
      if (filter.status && filter.status !== 'ALL') query = query.eq('status', filter.status);

      const { data, error } = await query;
      if (error) throw error;

      return (data || []).map(row => ({
        submissionId: row.submission_id,
        examId: row.exam_id,
        roll: row.roll,
        name: row.name,
        branch: row.branch,
        batch: row.batch,
        score: parseFloat(row.score),
        accuracy: row.accuracy,
        time: row.time_taken,
        trust: row.trust_score,
        tabs: row.tab_switches,
        status: row.status,
        timestamp: row.created_at
      }));
    } catch (err) {
      console.warn("⚠️ [Supabase DB query warning]:", err.message);
      return null;
    }
  },

  // Insert Proctoring & Audit Event Log
  async saveLog(logItem) {
    if (!supabase) return null;
    try {
      const { data, error } = await supabase
        .from('audit_logs')
        .insert([{
          time_str: logItem.time,
          type: logItem.type,
          subject: logItem.subject,
          detail: logItem.detail,
          status: logItem.status
        }]);

      if (error) throw error;
      return data;
    } catch (err) {
      return null;
    }
  },

  // Save Examination
  async saveExam(exam) {
    if (!supabase) return null;
    try {
      const payload = {
        id: exam.id,
        title: exam.title,
        type: exam.type || 'aptitude',
        category: exam.category || 'Placement Assessment',
        description: exam.description || '',
        duration_minutes: exam.durationMinutes || 15,
        question_count: exam.questionCount || 30,
        total_marks: exam.totalMarks || 30,
        marks_per_correct: exam.marksPerCorrect || 1.0,
        negative_mark: exam.negativeMark || 0.25,
        marking_policy: exam.markingPolicy || 'gate',
        target_batches: exam.targetBatches || ['2027', '2028'],
        target_departments: exam.targetDepartments || ['CSE', 'IT', 'CSM', 'CSD', 'ECE'],
        proctoring_strictness: exam.proctoringStrictness || 'strict',
        status: exam.status || 'LIVE',
        questions: exam.questions || [],
        game_config: exam.gameConfig || null
      };

      const { data, error } = await supabase
        .from('exams')
        .upsert(payload, { onConflict: 'id' });

      if (error) throw error;
      return data;
    } catch (err) {
      console.warn("⚠️ [Supabase Exam write warning]:", err.message);
      return null;
    }
  }
};

module.exports = SupabaseService;
