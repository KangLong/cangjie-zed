const { terminator } = require("./grammar_common");

const hexDigit = /[0-9a-fA-F]/;
const octalDigit = /[0-7]/;
const decimalDigit = /[0-9]/;
const binaryDigit = /[01]/;

const hexDigits = seq(hexDigit, repeat(choice('_', hexDigit)));
const octalDigits = seq(octalDigit, repeat(choice('_', octalDigit)));
const decimalDigits = seq(decimalDigit, repeat(choice('_', decimalDigit)));
const binaryDigits = seq(binaryDigit, repeat(choice('_', binaryDigit)));

const hexLiteral = seq('0', choice('x', 'X'), hexDigits);
const octalLiteral = seq('0', choice('o', 'O'), octalDigits);
const binaryLiteral = seq('0', choice('b', 'B'), binaryDigits);
const decimalLiteral = choice(decimalDigit, seq(/[1-9]/, repeat1(choice('_', decimalDigit))));

const intLiteral = seq(
    choice(binaryLiteral, octalLiteral, hexLiteral, decimalLiteral),
    optional(/[iu](8|16|32|64)/),
);

const decimalExponent = seq(choice('e', 'E'), optional(choice('+', '-')), decimalDigits);
const decimalFloatLiteral = seq(
    choice(
        seq(decimalLiteral, decimalExponent),
        seq(decimalLiteral, '.', decimalDigits, optional(decimalExponent)),
        seq('.', decimalDigits, optional(decimalExponent)),
    ),
    optional(/[fF](16|32|64)/),
);

const hexExponent = seq(choice('p', 'P'), optional(choice('+', '-')), decimalDigits);
const hexMantissa = choice(
    seq(hexDigits),
    seq(hexDigits, '.', hexDigits),
    seq('.', hexDigits),
);
const hexFloatLiteral = seq('0', choice('x', 'X'), hexMantissa, hexExponent);
const floatLiteral = choice(decimalFloatLiteral, hexFloatLiteral);

const uniCharacterLiteral = seq('\\u{', /[0-9a-fA-F]{1,8}/, '}');
const escapedIdentifier = /\\[tbrn'"\\fv0\$]/;

const runeLiteral = choice(
    seq('r\'', choice(/[^'\\]/, uniCharacterLiteral, escapedIdentifier), '\''),
    seq('r"', choice(/[^"\\]/, uniCharacterLiteral, escapedIdentifier), '"'),
);

module.exports = function ($) {
    return {
        _literal: $ => choice($.integerLiteral, $.floatLiteral, $.runeLiteral, $.booleanLiteral, $.stringLiteral, $.unitLiteral),
        integerLiteral: _ => token(intLiteral),
        floatLiteral: _ => token(floatLiteral),
        runeLiteral: _ => token(runeLiteral),
        booleanLiteral: _ => token(choice('true', 'false')),
        stringLiteral: $ => choice($._lineStringLiteral, $._multiLineStringLiteral, $._multiLineRawStringLiteral),
        _lineStringLiteral: $ => choice(
            seq('\'', repeat(choice(/[^'\\]/, uniCharacterLiteral, escapedIdentifier, $.inlineExpression)), '\''),
            seq('"', repeat(choice(/[^"\\]/, uniCharacterLiteral, escapedIdentifier, $.inlineExpression)), '"'),
        ),
        inlineExpression: $ => seq('${', $._expression, repeat(seq(repeat1(';'), $._expression)), '}'),
        _multiLineStringLiteral: $ => seq(seq('"""', /\r?\n/), repeat(choice(/[^\\]/, uniCharacterLiteral, escapedIdentifier, $.inMultiLineStringExpression)), '"""'),
        inMultiLineStringExpression: $ => seq('${', optional(seq($._expression, repeat(seq(repeat(terminator), $._expression)))), '}'),
        _multiLineRawStringLiteral: $ => seq($._multiLineRawStringStart, optional($._multiLineRawStringContent), $._multiLineRawStringEND),
        unitLiteral: _ => seq('(', ')'),
    };
};
