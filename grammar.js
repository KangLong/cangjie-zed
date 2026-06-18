/**
 * @file Cangjie grammar for tree-sitter
 * @author vchuoshen6 <vchuoshen6@163.com>
 * @license MULANPLS v2.0
 */

/// <reference types="tree-sitter-cli/dsl" />
// @ts-check

const {
    PREC,
    SYMBOLS,
    TOKENS,
    newline,
    terminator,
    sep1,
    commaSep,
    commaSep1
} = require('./grammar_common');

const BINARY_OPERATORS = [
    ['>', PREC.REL],
    ['<', PREC.REL],
    ['>=', PREC.REL],
    ['<=', PREC.REL],
    ['==', PREC.EQUALITY],
    ['!=', PREC.EQUALITY],
    ['&&', PREC.AND],
    ['||', PREC.OR],
    ['+', PREC.ADD_SUB],
    ['-', PREC.ADD_SUB],
    ['*', PREC.MUL_DIV],
    ['/', PREC.MUL_DIV],
    ['**', PREC.POWER],
    ['&', PREC.BIT_AND],
    ['|', PREC.BIT_OR],
    ['^', PREC.BIT_XOR],
    ['%', PREC.MUL_DIV],
    ['<<', PREC.SHIFT],
    ['>>', PREC.SHIFT],
    ['is', PREC.REL],
    ['as', PREC.REL],
    ['??', PREC.OR],
    ['|>', PREC.PIPE],
    ['~>', PREC.PIPE],
];

const Literal = require('./grammar_literal');

const M = {
    name: 'cangjie',

    extras: $ => [
        /\s/,  //空白
        $.lineComment,
        $.blockComment,
    ],

    word: $ => $.identifier,

    externals: $ => [
        $._multiLineRawStringStart,
        $._multiLineRawStringContent,
        $._multiLineRawStringEND,
    ],

    supertypes: $ => [
    ],

    inline: $ => [
    ],

    conflicts: $ => [
        [$.modifiers],
        [$.modifiers, $.variableDeclaration],
        [$.callSuffix, $.unitLiteral],
        [$.callSuffix, $.tupleExpression],
        [$.callSuffix, $.parenthesizedExpression],
        [$.arrayLiteral, $.indexAccess],
        [$.functionDefinition],
        [$.trailingLambdaExpression, $.lambdaExpression],
        [$._memberDeclarations],
        [$._topObjects],
        [$.primaryInit, $.thisSuperExpression],
        [$.atomicVariable],
        [$.macroExpression],
    ],

    precedences: $ => [
    ],

    rules: {
        translationUnit: $ => seq(
            optional(choice($.packageDeclaration, $.macroPackageDeclaration)),
            repeat($.importList),
            optional($._topObjects),
            optional($.mainDefinition),
            optional($._topObjects),
        ),
        _topObjects: $ => seq(optional(seq($._topObjects, repeat1(terminator))), $._topLevelObject, optional(repeat1(terminator))),

        packageDeclaration: $ => seq(
            optional($.modifiers),
            TOKENS.PACKAGE, field('packageName', $._name), repeat1(terminator)
        ),
        macroPackageDeclaration: $ => seq(
            optional($.modifiers),
            TOKENS.MACRO, TOKENS.PACKAGE, field('packageName', $._name), repeat1(terminator)
        ),
        modifiers: _ => repeat1(choice(
            TOKENS.PUBLIC,
            TOKENS.PROTECTED,
            TOKENS.PRIVATE,
            TOKENS.INTERNAL,
            TOKENS.ABSTRACT,
            TOKENS.STATIC,
            TOKENS.SEALED,
            TOKENS.REDEF,
            TOKENS.OPEN,
            TOKENS.OVERRIDE,
            TOKENS.MUT,
            TOKENS.UNSAFE,
            TOKENS.CONST,
        )),
        _name: $ => choice(
            $.identifier,
            $._reserved_identifier,
            $.scoped_identifier,
        ),
        scoped_identifier: $ => seq(
            field("scope", $._name), '.', field('name', choice($.identifier, $._reserved_identifier))),
        importList: $ => seq(
            optional($.modifiers),
            TOKENS.IMPORT,
            choice(
                $._importPackages,
                $.packageGroup,
                $.subGroupOfPackage,
            ),
            repeat1(terminator)
        ),
        _importPackages: $ => choice(
            prec.right(-3, field('packageName', $._name)),
            prec.right(-2, $.packageFull),
            prec.right(-1, $.packageAlias),
        ),
        packageAlias: $ => seq(
            field('packageName', $._name),
            TOKENS.AS,
            field('alias', choice($.identifier, $._reserved_identifier)),
        ),
        packageFull: $ => seq(field('packageName', $._name), '.', $.asterisk),
        packageGroup: $ => seq(
            '{',
            seq($._importPackages, repeat(seq(',', $._importPackages))),
            '}',
        ),
        subGroupOfPackage: $ => seq(field('packageName', $._name), '.', $.packageGroup),
        asterisk: _ => '*',

        //types
        _type: $ => choice(
            $.arrowType,
            $.tupleType,
            $.prefixType,
            alias(TOKENS.INT8, $.Int8),
            alias(TOKENS.INT16, $.Int16),
            alias(TOKENS.INT32, $.Int32),
            alias(TOKENS.INT64, $.Int64),
            alias(TOKENS.INTNATIVE, $.IntNative),
            alias(TOKENS.UINT8, $.UInt8),
            alias(TOKENS.UINT16, $.UInt16),
            alias(TOKENS.UINT32, $.UInt32),
            alias(TOKENS.UINT64, $.UInt64),
            alias(TOKENS.UINTNATIVE, $.UIntNative),
            alias(TOKENS.FLOAT16, $.Float16),
            alias(TOKENS.FLOAT32, $.Float32),
            alias(TOKENS.FLOAT64, $.Float64),
            alias(token('String'), $.String),
            alias(TOKENS.RUNE, $.Rune),
            alias(TOKENS.BOOL, $.Bool),
            alias(TOKENS.NOTHING, $.Nothing),
            alias(TOKENS.UNIT, $.Unit),
            alias(TOKENS.THISTYPE, $.Thistype),
            $.userType,
            $.arrayType,
            $.rangeType,
        ),

        arrowType: $ => seq('(', optional($._typeList), ')', token('->'), $._type),

        tupleType: $ => seq('(', $._typeList, ')'),

        _typeList: $ => commaSep1($._type),

        prefixType: $ => seq('?', $._type),

        userType: $ => seq($._name, optional($.typeArguments)),
        arrayType: $ => seq(token('Array'), $.typeArguments),
        rangeType: $ => seq(token('Range'), $.typeArguments),

        parenthesizedType: $ => seq('(', $._type, ')'),

        typeArguments: $ => seq('<', $._typeList, '>'),

        typeParameters: $ => seq('<', commaSep1($.identifier), '>'),

        //patterns
        _pattern: $ => choice(
            $.wildcardPattern,
            $._varBindingPattern,
            $.tuplePattern,
            $.enumPattern,
            $._constantPattern,
            $.typePattern,
        ),
        wildcardPattern: _ => token('_'),
        _constantPattern: $ => alias($._literal, $.constantPattern),
        _varBindingPattern: $ => alias($.identifier, $.varBindingPattern),
        tuplePattern: $ => seq('(', commaSep1($._pattern), ')'),
        enumPattern: $ => seq(
            optional(seq($._name, optional($.typeArguments), '.')), $._varBindingPattern, $.tuplePattern
        ),
        typePattern: $ => seq(choice($.wildcardPattern, $._varBindingPattern), ':', $._type),

        _deconstructPattern: $ => choice(
            $.wildcardPattern,
            $._varBindingPattern,
            $.tuplePattern,
            $.enumPattern,
            $._constantPattern,
        ),

        _patternsMaybeIrrefutable: $ => choice(
            $.wildcardPattern,
            $._varBindingPattern,
            $.tuplePattern,
            $.enumPattern
        ),

        patternGuard: $ => seq(TOKENS.WHERE, $._expression),

        catchPattern: $ => choice($.wildcardPattern, $._exceptionTypePattern),
        _exceptionTypePattern: $ => seq(choice($.wildcardPattern, $._varBindingPattern), ':', sep1($._type, '|')),

        mainDefinition: $ => seq(
            TOKENS.MAIN, $.parameterList, optional($.returnType),
            $.block
        ),

        block: $ => seq(
            '{',
            optional(seq($._expressionOrDeclarations, optional(repeat1(terminator)))),
            '}',
        ),
        _expressionOrDeclarations: $ => seq(
            optional(seq($._expressionOrDeclarations, repeat(terminator))),
            choice(
                $.variableDeclaration,
                $.functionDefinition,
                $.assignmentExpression,
                $._expression
            ),
        ),

        //top level objects
        _topLevelObject: $ => choice(
            $.variableDeclaration,
            $.functionDefinition,
            $.classDefinition,
            $.interfaceDefinition,
            $.structDefinition,
            $.enumDefinition,
            $.typeAlias,
            $.extendDefinition,
            $.foreignDeclaration,
            $.macroDefinition,
            $.macroExpression
        ),
        variableDeclaration: $ => seq(
            optional($.modifiers),
            choice(TOKENS.LET, TOKENS.VAR, TOKENS.CONST),
            alias($._patternsMaybeIrrefutable, $.variableName),
            choice(
                seq(':', field('type', $._type), optional(seq('=', field("initilizer", $._expression)))),
                seq('=', field("initilizer", $._expression))
            ),
        ),
        functionDefinition: $ => seq(
            optional($.modifiers),
            TOKENS.FUNC,
            $._functionName,
            optional($.typeParameters),
            $.parameterList,
            optional($.returnType),
            optional($.genericConstraints),
            optional($.block)
        ),
        _functionName: $ => alias($.identifier, $.funcName),
        parameterList: $ => seq(
            '(',
            optional(choice(
                seq($._unnamedParameterList, optional(seq(',', $._namedParameterList))),
                $._namedParameterList
            )),
            ')',
        ),
        _unnamedParameterList: $ => seq(optional(seq($._unnamedParameterList, ',')), $.parameter),
        _namedParameterList: $ => seq(optional(seq($._namedParameterList, ',')), $.namedParameter),
        parameter: $ => seq(
            field('paraName', choice($.identifier, '_')),
            ':',
            field('type', $._type)
        ),
        namedParameter: $ => seq(
            seq(field('paraName', $.identifier), '!'),
            ':',
            field('type', $._type),
            optional(seq('=', field('defaultValue', $._expression)))
        ),
        returnType: $ => seq(':', $._type),

        genericConstraints: $ => seq(TOKENS.WHERE, commaSep1($.genericConstraint)),
        genericConstraint: $ => seq(
            choice($.identifier, TOKENS.THIS),
            token('<:'),
            sep1($._type, '&')
        ),

        operatorFunctionDefinition: $ => seq(
            optional($.modifiers),
            TOKENS.OPERATOR, TOKENS.FUNC,
            alias(choice(
                token(seq('[', ']')),
                token('!'), token('+'), token('-'), token('**'), token('*'), token('/'), token('%'), 
                token('<<'), token('>>'), token('<'), token('>'), token('<='), token('>='), 
                token('=='), token('!='), token('&'), token('^'), token('|')
            ), $.operator),
            optional($.typeParameters),
            $.parameterList,
            optional($.returnType),
            optional($.genericConstraints),
            optional($.block)
        ),

        interfaceDefinition: $ => seq(
            optional($.modifiers),
            TOKENS.INTERFACE,
            $._interfaceName,
            optional($.typeParameters),
            optional(seq(token('<:'), $._superInterfaces)),
            optional($.genericConstraints),
            '{',
            optional($.interfaceBody),
            '}',
        ),
        _interfaceName: $ => alias($.identifier, $.interfaceName),
        _superInterfaces: $ => seq(optional(seq($._superInterfaces, '&')), $._interfaceType),
        _interfaceType: $ => seq(alias($._name, $.superOrInterface), optional($.typeParameters)),
        interfaceBody: $ => seq(
            optional(seq($.interfaceBody, repeat1(terminator))),
            $._interfaceBodyStatement,
        ),
        _interfaceBodyStatement: $ => choice(
            $.functionDefinition,
            $.operatorFunctionDefinition,
            $.propertyDefinition,
            $.macroExpression,
        ),

        propertyDefinition: $ => seq(
            optional($.modifiers),
            TOKENS.PROP, $._propertyName, ':', field('type', $._type),
            '{',
            optional(field('getter', seq(token('get'), '(', ')', $.block))),
            optional(field('setter', seq(token('set'), '(', $.identifier, ')', $.block))),
            '}'
        ),
        _propertyName: $ => alias($.identifier, $.propertyName),

        classDefinition: $ => seq(
            optional($.modifiers),
            TOKENS.CLASS, $._className, optional($.typeParameters),
            optional(seq(token('<:'), $._superInterfaces)),
            optional($.genericConstraints),
            $.classBody,
        ),
        _className: $ => alias($.identifier, $.className),
        classBody: $ => seq(
            '{',
            optional($._memberDeclarations),
            optional($.primaryInit),
            optional($.finalizer),
            optional($._memberDeclarations),
            '}'
        ),
        _memberDeclarations: $ => seq(
            optional(seq($._memberDeclarations, repeat1(terminator))),
            choice(
                $.variableDeclaration,
                $.functionDefinition,
                $.operatorFunctionDefinition,
                $.propertyDefinition,
                $.init,
                $.staticInit,
                $.macroExpression,
            ), optional(repeat1(terminator)),
        ),
        init: $ => prec(-1, seq(
            optional($.modifiers),
            TOKENS.INIT, $.parameterList,
            $.block
        )),
        staticInit: $ => prec(-2, seq(
            TOKENS.STATIC, TOKENS.INIT, '(', ')',
            $.block,
        )),
        primaryInit: $ => seq(
            optional($.modifiers),
            $._className, $.primaryInitParamList,
            '{',
            optional(seq(TOKENS.SUPER, $.callSuffix, terminator)),
            optional(repeat(seq(
                choice(
                    $._expression,
                    $.assignmentExpression,
                    $.variableDeclaration,
                    $.functionDefinition,
                ),
                optional(terminator)),
            )),
            '}'
        ),
        primaryInitParamList: $ => seq('(',
            choice(
                seq($._unnamedParameterList, optional(seq(',', $._namedMemberParamList))),
                seq($._unnamedParameterList, seq(',', $._namedParameterList), optional(seq(',', $._namedMemberParamList))),
                seq($._unnamedParameterList, seq(',', $._unnamedMemberParamList), optional(seq(',', $._namedMemberParamList))),
                seq($._unnamedMemberParamList, optional(seq(',', $._namedMemberParamList))),
                seq($._namedParameterList, optional(seq(',', $._namedMemberParamList))),
                optional($._namedMemberParamList)),
            ')'
        ),
        _unnamedMemberParamList: $ => prec.right(commaSep1($.unnamedMemberParam)),
        unnamedMemberParam: $ => seq(
            optional($.modifiers),
            choice(TOKENS.LET, TOKENS.VAR),
            $.parameter
        ),

        _namedMemberParamList: $ => prec.right(commaSep1($.namedMemeberParam)),
        namedMemeberParam: $ => seq(
            optional($.modifiers),
            choice(TOKENS.LET, TOKENS.VAR),
            $.namedParameter
        ),

        finalizer: $ => seq(
            '~', TOKENS.INIT, '(', ')',
            $.block
        ),

        structDefinition: $ => seq(
            optional($.modifiers),
            TOKENS.STRUCT, $._structName,
            optional($.typeParameters),
            optional(seq(token('<:'), $._superInterfaces)),
            optional($.genericConstraints),
            $.structBody,
        ),
        _structName: $ => alias($.identifier, $.structName),
        structBody: $ => seq(
            '{',
            optional($._memberDeclarations),
            optional($.primaryInit),
            optional($._memberDeclarations),
            '}'
        ),

        enumDefinition: $ => seq(
            optional($.modifiers),
            TOKENS.ENUM,
            $._enumName,
            optional($.typeParameters),
            optional(seq(token('<:'), $._superInterfaces)),
            optional($.genericConstraints),
            $.enumBody
        ),
        _enumName: $ => alias($.identifier, $.enumName),
        enumBody: $ => seq(
            '{', optional('|'),
            sep1(field('enumConstant', $._caseBody), '|'),
            repeat(choice(
                $.functionDefinition,
                $.operatorFunctionDefinition,
                $.propertyDefinition,
                $.macroExpression
            )),
            '}'
        ),
        _caseBody: $ => seq(
            $.identifier,
            optional(seq('(', commaSep1($._type), ')'))
        ),

        typeAlias: $ => seq(
            optional($.modifiers),
            TOKENS.TYPE,
            alias($.identifier, $.typeAliasName),
            optional($.typeParameters),
            '=',
            field('type', $._type)
        ),

        extendDefinition: $ => seq(
            TOKENS.EXTEND,
            $.extendType,
            optional(seq(token('<:'), $._superInterfaces)),
            optional($.genericConstraints),
            $.extendBody,
        ),

        extendType: $ => choice(
            seq(
                optional($.typeParameters),
                $._name, optional($.typeArguments)
            ),
            TOKENS.INT8, TOKENS.INT16, TOKENS.INT32, TOKENS.INT64, TOKENS.INTNATIVE,
            TOKENS.UINT8, TOKENS.UINT16, TOKENS.UINT32, TOKENS.UINT64, TOKENS.UINTNATIVE,
            TOKENS.FLOAT16, TOKENS.FLOAT32, TOKENS.FLOAT64,
            TOKENS.RUNE, TOKENS.BOOL, TOKENS.NOTHING, TOKENS.UNIT,
            token('String'), token('Range'),
        ),

        extendBody: $ => seq(
            '{',
            repeat(seq(choice(
                $.functionDefinition,
                $.operatorFunctionDefinition,
                $.propertyDefinition,
                $.macroExpression
            ), repeat(terminator))),
            '}'
        ),

        foreignDeclaration: $ => seq(
            TOKENS.FOREIGN,
            choice($.foreignBody, $._foreignMemberDeclaration)
        ),

        foreignBody: $ => seq(
            '{',
            repeat(seq($._foreignMemberDeclaration, repeat(terminator))),
            '}'
        ),

        _foreignMemberDeclaration: $ => choice(
            $.classDefinition,
            $.interfaceDefinition,
            $.functionDefinition,
            $.macroExpression,
            $.variableDeclaration
        ),

        macroDefinition: $ => seq(
            $.modifiers, TOKENS.MACRO, $._macroName,
            seq(
                '(',
                seq($.identifier, ':', $.identifier),
                optional(seq($.identifier, ':', $.identifier)),
                ')',
            ),
            optional(seq(':', $.identifier)),
            choice(
                seq('=', $._expression),
                $.block
            )
        ),
        _macroName: $ => alias($.identifier, $.macroName),

        annotationList: $ => repeat1($.annotation),
        annotation: $ => seq(
            '@', alias(seq(repeat(seq($.identifier, '.')), $.identifier), $.annotationName),
            optional(seq('[', $._annotationArgumentList, ']'))
        ),
        _annotationArgumentList: $ => seq(repeat(seq($.annotationArgument, ',')), $.annotationArgument, optional(',')),
        annotationArgument: $ => choice(
            seq($.parameter, ':', $._expression),
            $._expression
        ),

        // expressions
        assignmentExpression: $ => prec.right(PREC.ASSIGN, seq(
            field('variable', $._expression),
            field('operator', choice(
                token('='), token('+='), token('-='), token('*='), token('/='), 
                token('%='), token('**='), token('&='), token('|='), token('^='),
                token('<<='), token('>>='), token("&&="), token("||=")
            )),
            field('value', $._expression),
        )),

        _expression: $ => choice(
            $.unaryExpression,
            $.binaryExpreesion,
            $._atomicExpression,
        ),

        _atomicExpression: $ => choice(
            $._literal,
            $.arrayLiteral,
            $.atomicVariable,
            $.rangeExpression,
            $.parenthesizedExpression,
            $.tupleExpression,
            $.postfixExpression,
            $.jumpExpression,
            $.lambdaExpression,
            $.synchronizedExpression,
            $.spawnExpression,
            $.unsafeExpression,
            $.thisSuperExpression,
            $.ifExpression,
            $.matchExpression,
            $._loopExpression,
            $.tryExpression,
            $.quoteExpression,
            $.macroExpression,
            $._dollarIdentifier,
            $._dollarCall,
        ),

        _dollarCall: $ => seq(token('$('), $._expression, ')'),

        unaryExpression: $ => prec.left(PREC.UNARY, seq(
            field('operator', choice('!', '-')),
            field('argument', $._expression)
        )),

        binaryExpreesion: $ => choice(...BINARY_OPERATORS.map(([operator, precedence]) => prec.left(precedence, seq(
            field('left', $._expression),
            field('operator', token(operator)),
            field('right', $._expression)
        )))),

        arrayLiteral: $ => seq('[', commaSep(choice($._expression, seq('*', $._expression))), ']'),
        atomicVariable: $ => seq($._varBindingPattern, optional($.typeArguments)),
        parenthesizedExpression: $ => seq('(', $._expression, ')'),
        rangeExpression: $ => prec.right(PREC.RANGE, seq(
            field('start', $._expression),
            choice(token('..'), token('..=')),
            field('end', $._expression),
            optional(seq(':', field('step', $._expression)))
        )),

        postfixExpression: $ => prec.right(29, seq(
            $._expression,
            choice(
                prec(PREC.MEMBER, $.fieldAccess),
                prec(PREC.ARRAY, $.indexAccess),
                prec(PREC.POSTFIX, $.questAccess),
                prec(PREC.PARENS, $.callSuffix),
                prec(PREC.POSTFIX, $.incOrDec),
                $.trailingLambdaExpression,
            )
        )),

        fieldAccess: $ => seq('.', $.atomicVariable),
        callSuffix: $ => seq(
            '(',
            commaSep(choice(
                seq($._varBindingPattern, ':', $._expression),
                $._expression,
                seq(TOKENS.INOUT, optional(seq($._expression, '.')), $._varBindingPattern)
            )),
            ')'
        ),

        // ... remaining rules ...
        indexAccess: $ => seq('[',
            choice(
                seq($._expression, optional(token('..'))),
                seq($._expression, choice(token('..'), token('..=')), $._expression, optional(seq(':', $._expression))),
                seq(token('..'), $._expression,)
            ), ']'
        ),
        questAccess: _ => '?',
        incOrDec: _ => choice(token('++'), token('--')),

        tupleExpression: $ => seq('(', $._expression, repeat1(seq(',', $._expression)), ')'),
        trailingLambdaExpression: $ => seq(
            '{',
            optional(seq(optional($.lambdaParameters), token('=>'))),
            optional(seq($._expressionOrDeclarations, repeat(terminator))),
            '}'
        ),
        lambdaParameters: $ => commaSep1($.lambdaParameter),
        lambdaParameter: $ => seq(choice($._varBindingPattern, '_'), optional(seq(':', $._type))),

        jumpExpression: $ => choice(
            prec.right(seq(TOKENS.THROW, $._expression)),
            prec.right(seq(TOKENS.RETURN, optional($._expression))),
            TOKENS.CONTINUE,
            TOKENS.BREAK,
        ),
        thisSuperExpression: _ => choice(TOKENS.THIS, TOKENS.SUPER),
        lambdaExpression: $ => seq(
            '{', optional($.lambdaParameters), token('=>'),
            $._expressionOrDeclarations, optional(repeat1(terminator)), '}'
        ),
        spawnExpression: $ => seq(TOKENS.SPAWN, optional(seq('(', $._expression, ')')), $.trailingLambdaExpression),
        synchronizedExpression: $ => seq(TOKENS.SYNCHRONIZED, '(', $._expression, ')', $.block),
        unsafeExpression: $ => seq(TOKENS.UNSAFE, $.block),
        ifExpression: $ => prec.left(seq(
            TOKENS.IF,
            field('condition', seq('(', optional(seq(TOKENS.LET, $._patternsMaybeIrrefutable, token('<-'))), $._expression, ')')),
            field('consequence', $.block),
            optional(field('alternative', seq(TOKENS.ELSE, choice($.ifExpression, $.block))))
        )),
        matchExpression: $ => choice(
            seq(TOKENS.MATCH, '(', $._expression, ')',
                '{', repeat1($.matchCase), '}'
            ),
            seq(TOKENS.MATCH, '{', repeat1($.matchCaseBody), '}')
        ),
        matchCase: $ => seq(
            TOKENS.CASE, sep1($._pattern, '|'), optional($.patternGuard),
            token('=>'), $._expressionOrDeclarations, optional(repeat1(terminator)),
        ),
        matchCaseBody: $ => seq(
            TOKENS.CASE, choice($._expression, '_'), token('=>'),
            $._expressionOrDeclarations, optional(repeat1(terminator)),
        ),
        _loopExpression: $ => choice($.forInExpression, $.whileExpression, $.doWhileExpression),
        forInExpression: $ => seq(
            TOKENS.FOR, '(', $._patternsMaybeIrrefutable, TOKENS.IN, $._expression, optional($.patternGuard), ')', $.block
        ),
        whileExpression: $ => seq(
            TOKENS.WHILE, '(', optional(seq(TOKENS.LET, $._deconstructPattern, token('<-'))), $._expression, ')', $.block
        ),
        doWhileExpression: $ => seq(TOKENS.DO, field('body', $.block), TOKENS.WHILE, '(', $._expression, ')'),
        tryExpression: $ => prec.right(choice(
            seq(TOKENS.TRY, field('try_body', $.block), TOKENS.FINALLY, field('finally_body', $.block)),
            seq(TOKENS.TRY, field('try_body', $.block),
                repeat1(seq(TOKENS.CATCH, '(', $.catchPattern, ')', field('catch_body', $.block))),
                optional(seq(TOKENS.FINALLY, field('finally_body', $.block)))),
            seq(TOKENS.TRY, '(', $.resourceSpecifications, ')', field('try_body', $.block),
                repeat(seq(TOKENS.CATCH, '(', $.catchPattern, ')', field('catch_body', $.block))),
                optional(seq(TOKENS.FINALLY, field('finally_body', $.block))))
        )),
        resourceSpecifications: $ => commaSep1($.resourceSpecification),
        resourceSpecification: $ => seq($.identifier, optional(seq(':', $._type)), '=', $._expression),
        macroExpression: $ => seq(
            '@', $._macroName, 
            optional(seq('[', optional(seq(repeat(seq($._expression, ',')), $._expression)), ']')),
            optional(seq('(', optional(seq(repeat(seq($._expression, ',')), $._expression)), ')')),
        ),
        quoteExpression: $ => prec(9, seq(TOKENS.QUOTE, '(', repeat1($._expression), ')')),
        lineComment: _ => token(prec(PREC.COMMENT, seq('//', /[^\r\n\u2028\u2029]*/))),
        blockComment: _ => token(prec(PREC.COMMENT, seq('/*', /[^*]*\*+([^/*][^*]*\*+)*/, '/'))),
        _reserved_identifier: $ => choice(
            prec(-3, alias(choice(
                TOKENS.PUBLIC, TOKENS.PROTECTED, TOKENS.PRIVATE, TOKENS.INTERNAL,
                TOKENS.ABSTRACT, TOKENS.SEALED, TOKENS.REDEF, TOKENS.OPEN, TOKENS.OVERRIDE,
                token('get'), token('set'),
            ), $.identifier))
        ),
        identifier: _ => token(choice(
            /[a-zA-Z_][a-zA-Z0-9_]*/,
            seq('`', /[a-zA-Z_][a-zA-Z0-9_]*/, '`'),
        )),
        _dollarIdentifier: $ => seq('$', $.identifier),

        ...Literal(),
    },
};

module.exports = grammar(M);
