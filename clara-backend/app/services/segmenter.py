import re
from typing import List, Dict, Any

class ClauseSegmenter:
    """
    NLP & Rule-based clause segmenter for Legal Documents, Terms & Conditions, 
    Privacy Policies, EULAs, and Contracts.
    """
    
    @staticmethod
    def clean_text(text: str) -> str:
        if not text:
            return ""
        # Remove script and style elements if HTML
        text = re.sub(r'<script.*?>.*?</script>', '', text, flags=re.DOTALL | re.IGNORECASE)
        text = re.sub(r'<style.*?>.*?</style>', '', text, flags=re.DOTALL | re.IGNORECASE)
        # Strip generic tags but keep line structure
        text = re.sub(r'<br\s*/?>', '\n', text, flags=re.IGNORECASE)
        text = re.sub(r'</p>', '\n\n', text, flags=re.IGNORECASE)
        text = re.sub(r'<[^>]+>', ' ', text)
        # Clean multiple spaces and normalize newlines
        text = re.sub(r'[ \t]+', ' ', text)
        text = re.sub(r'\n\s*\n', '\n\n', text)
        return text.strip()

    @classmethod
    def segment(cls, text: str) -> List[Dict[str, Any]]:
        cleaned = cls.clean_text(text)
        if not cleaned:
            return []

        # Split by section numbers, headings, or paragraph breaks
        # e.g., "Section 1.", "1.", "Article I"
        heading_split_pattern = r'\n(?=(?:Section\s+\d+|Article\s+[IVX\d]+|\d{1,2}\.|\b[A-Z\s]{4,30}\b:))'
        raw_blocks = re.split(heading_split_pattern, cleaned)
        if len(raw_blocks) <= 1:
            raw_blocks = re.split(r'\n{2,}', cleaned)

        clauses = []
        clause_id_counter = 1

        for block in raw_blocks:
            block = block.strip()
            if not block:
                continue


            # Identify title/heading if present
            lines = [l.strip() for l in block.split('\n') if l.strip()]
            if not lines:
                continue

            section_heading = "General Terms"
            clause_body = block

            if len(lines) > 1 and len(lines[0]) < 80 and not lines[0].endswith('.'):
                section_heading = lines[0]
                clause_body = " ".join(lines[1:])
            elif re.match(r'^(?:\d+\.|\bSection\b|\bArticle\b)', lines[0], re.IGNORECASE):
                first_line = lines[0]
                parts = first_line.split('.', 1)
                if len(parts) > 1 and len(parts[0]) < 10:
                    section_heading = first_line[:60]
                clause_body = " ".join(lines)

            # If block is very long, sub-segment by sentences
            if len(clause_body) > 800:
                sub_sentences = re.split(r'(?<=[.!?])\s+(?=[A-Z])', clause_body)
                curr_chunk = ""
                for sent in sub_sentences:
                    if len(curr_chunk) + len(sent) < 500:
                        curr_chunk += (" " if curr_chunk else "") + sent
                    else:
                        if curr_chunk:
                            clauses.append({
                                "id": f"clause-{clause_id_counter}",
                                "sectionHeading": section_heading,
                                "text": curr_chunk.strip(),
                                "orderIndex": clause_id_counter
                            })
                            clause_id_counter += 1
                        curr_chunk = sent
                if curr_chunk:
                    clauses.append({
                        "id": f"clause-{clause_id_counter}",
                        "sectionHeading": section_heading,
                        "text": curr_chunk.strip(),
                        "orderIndex": clause_id_counter
                    })
                    clause_id_counter += 1
            else:
                clauses.append({
                    "id": f"clause-{clause_id_counter}",
                    "sectionHeading": section_heading,
                    "text": clause_body.strip(),
                    "orderIndex": clause_id_counter
                })
                clause_id_counter += 1

        return clauses
