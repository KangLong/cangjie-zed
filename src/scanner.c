#include <tree_sitter/parser.h>
#include <wctype.h>
#include <string.h>
#include <stdint.h>
#include <stdbool.h>
#include <stdlib.h>

/* Stub for WASI thread-local storage init that Zed's build requires */
void __wasi_init_tp(void) { }

enum TokenType {
  _MULTI_LINE_RAW_STRING_START,
  _MULTI_LINE_RAW_STRING_CONTENT,
  _MULTI_LINE_RAW_STRING_END,
};

typedef struct {
  bool in_string;
  uint8_t delimiter_length;
} Scanner;

static void advance(TSLexer *lexer) { lexer->advance(lexer, false); }
static void skip(TSLexer *lexer) { lexer->advance(lexer, true); }

void *tree_sitter_cangjie_external_scanner_create() {
  Scanner *s = (Scanner *)calloc(1, sizeof(Scanner));
  s->delimiter_length = 0; s->in_string = false;
  return s;
}
void tree_sitter_cangjie_external_scanner_destroy(void *p) { free(p); }
unsigned tree_sitter_cangjie_external_scanner_serialize(void *p, char *b) {
  Scanner *s = (Scanner *)p; b[0] = s->in_string?1:0; b[1] = (char)s->delimiter_length; return 2;
}
void tree_sitter_cangjie_external_scanner_deserialize(void *p, const char *b, unsigned l) {
  Scanner *s = (Scanner *)p;
  if (l>=2) { s->in_string=b[0]; s->delimiter_length=(uint8_t)b[1]; }
  else { s->delimiter_length=0; s->in_string=false; }
}

static bool scan_opening_delimiter(TSLexer *l, Scanner *s) {
  uint8_t h = 0;
  while (l->lookahead == '#') { advance(l); h++; if (h==255) return false; }
  if (l->lookahead != '"' || h == 0) { s->delimiter_length=0; s->in_string=false; return false; }
  advance(l); s->delimiter_length=h; s->in_string=true; l->result_symbol=_MULTI_LINE_RAW_STRING_START; return true;
}

static bool scan_closing_delimiter(TSLexer *l, Scanner *s) {
  advance(l); uint8_t h = 0;
  while (l->lookahead == '#') { advance(l); h++; if (h==255) return false; }
  if (h != s->delimiter_length) return false;
  advance(l); s->delimiter_length=0; s->in_string=false; l->result_symbol=_MULTI_LINE_RAW_STRING_END; return true;
}

static bool scan_string_content(TSLexer *l, Scanner *s) {
  if (!s->in_string) return false;
  l->result_symbol = _MULTI_LINE_RAW_STRING_CONTENT;
  while (true) {
    if (l->lookahead == '"') {
      l->mark_end(l); advance(l); uint8_t h = 0;
      while (l->lookahead == '#') { advance(l); h++; }
      if (h == s->delimiter_length) return true;
    } else if (l->lookahead == 0) { l->mark_end(l); return true; }
    else { advance(l); }
  }
}

bool tree_sitter_cangjie_external_scanner_scan(void *p, TSLexer *l, const bool *valid) {
  Scanner *s = (Scanner *)p;
  while (iswspace(l->lookahead)) skip(l);
  if (valid[_MULTI_LINE_RAW_STRING_START] && !s->in_string && l->lookahead=='#') return scan_opening_delimiter(l,s);
  if (valid[_MULTI_LINE_RAW_STRING_CONTENT] && s->in_string) return scan_string_content(l,s);
  if (valid[_MULTI_LINE_RAW_STRING_END] && s->in_string && l->lookahead=='"') return scan_closing_delimiter(l,s);
  return false;
}
