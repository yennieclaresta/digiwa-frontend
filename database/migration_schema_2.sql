-- Add human-readable label column to generated_documents
-- Stores labels like "Cetak KTP", "Surat KTP", etc.
ALTER TABLE generated_documents ADD COLUMN IF NOT EXISTS document_label TEXT;
