const newline = /\r?\n/;

const terminator = choice(newline, ';');

const PREC = {
    COMMENT: 0, ASSIGN: 11, PIPE: 12, OR: 13, AND: 14, BIT_OR: 15, BIT_XOR: 16,
    BIT_AND: 17, EQUALITY: 18, REL: 19, RANGE: 20, SHIFT: 21, ADD_SUB: 22,
    MUL_DIV: 23, POWER: 24, UNARY: 25, POSTFIX: 26, PARENS: 27, ARRAY: 28,
    MEMBER: 29, MARCO_CALL: 30,
};

const TOKENS = {
    AS: token('as'), BREAK: token('break'), BOOL: token('Bool'),
    CASE: token('case'), CATCH: token('catch'), CLASS: token('class'),
    CONST: token('const'), CONTINUE: token('continue'), RUNE: token('Rune'),
    DO: token('do'), ELSE: token('else'), ENUM: token('enum'),
    EXTEND: token('extend'), FOR: token('for'), FROM: token('from'),
    FUNC: token('func'), FALSE: token('FALSE'), FINALLY: token('finally'),
    FOREIGN: token('foreign'), FLOAT16: token('Float16'), FLOAT32: token('Float32'),
    FLOAT64: token('Float64'), IF: token('if'), IN: token('in'), IS: token('is'),
    INIT: token('init'), INOUT: token('inout'), IMPORT: token('import'),
    INTERFACE: token('interface'), INT8: token('Int8'), INT16: token('Int16'),
    INT32: token('Int32'), INT64: token('Int64'), INTNATIVE: token('IntNative'),
    LET: token('let'), MUT: token('mut'), MAIN: token('main'), MACRO: token('macro'),
    MATCH: token('match'), NOTHING: token('Nothing'), OPERATOR: token('operator'),
    PROP: token('prop'), PACKAGE: token('package'), QUOTE: token('quote'),
    RETURN: token('return'), SPAWN: token('spawn'), SUPER: token('super'),
    STATIC: token('static'), STRUCT: token('struct'), SYNCHRONIZED: token('synchronized'),
    TRY: token('try'), THIS: token('this'), TRUE: token('true'), TYPE: token('type'),
    THROW: token('throw'), THISTYPE: token('This'), UNSAFE: token('unsafe'),
    UNIT: token('Unit'), UINT8: token('UInt8'), UINT16: token('UInt16'),
    UINT32: token('UInt32'), UINT64: token('UInt64'), UINTNATIVE: token('UIntNative'),
    VAR: token('var'), VARRAY: token('VArray'), WHERE: token('where'),
    WHILE: token('while'), PUBLIC: token('public'), PROTECTED: token('protected'),
    INTERNAL: token('internal'), PRIVATE: token('private'), ABSTRACT: token('abstract'),
    SEALED: token('sealed'), REDEF: token('redef'), OPEN: token('open'),
    OVERRIDE: token('override'),
};

function commaSep1(rule) { return seq(rule, repeat(seq(',', rule))); }
function sep1(rule, separator) { return seq(rule, repeat(seq(separator, rule))); }
function commaSep(rule) { return optional(commaSep1(rule)); }

module.exports = { newline, terminator, PREC, TOKENS, sep1, commaSep, commaSep1 };
