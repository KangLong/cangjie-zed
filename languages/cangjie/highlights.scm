; ============================================================
; Cangjie (仓颉) Tree-sitter syntax highlights for Zed
; ============================================================

; -----------------------------------------------------------
; Comments
; -----------------------------------------------------------
(lineComment) @comment
(blockComment) @comment

; -----------------------------------------------------------
; Literals
; -----------------------------------------------------------
(integerLiteral) @number
(floatLiteral) @number.float
(runeLiteral) @string.special
(booleanLiteral) @boolean
(unitLiteral) @constant.builtin
(stringLiteral) @string
(wildcardPattern) @constant.builtin       ; wildcard _

; -----------------------------------------------------------
; String interpolation
; -----------------------------------------------------------
(inlineExpression) @embedded
(inMultiLineStringExpression) @embedded

; -----------------------------------------------------------
; Built-in types (primitive type keywords)
; -----------------------------------------------------------
[
  "Int8" "Int16" "Int32" "Int64" "IntNative"
  "UInt8" "UInt16" "UInt32" "UInt64" "UIntNative"
  "Float16" "Float32" "Float64"
  "Rune"
  "Bool"
  "Nothing"
  "Unit"
  "This"
] @type.builtin

(String) @type.builtin
(VArray) @type.builtin

; -----------------------------------------------------------
; User-defined types (class/struct/enum/interface names)
; -----------------------------------------------------------
(className) @type
(structName) @type
(enumName) @type
(interfaceName) @type
(typeAliasName) @type
(extendsType) @type

; -----------------------------------------------------------
; Functions & methods
; -----------------------------------------------------------
(funcName) @function
(functionDefinition
  name: (funcName) @function) @function

(operatorFunctionDefinition
  operator: _ @operator) @function

(callSuffix) @function.call

; -----------------------------------------------------------
; Properties & fields
; -----------------------------------------------------------
(propertyName) @property
(propertyDefinition
  name: (propertyName) @property) @property

; -----------------------------------------------------------
; Variables & parameters
; -----------------------------------------------------------
(varBindingPattern) @variable
(parameter
  paraName: (identifier) @variable.parameter)

; -----------------------------------------------------------
; this / super
; -----------------------------------------------------------
(thisSuperExpression) @variable.builtin

; -----------------------------------------------------------
; Return type annotations
; -----------------------------------------------------------
(returnType
  (_) @type)

; -----------------------------------------------------------
; Keywords — modifiers (visibility, static, abstract etc.)
; -----------------------------------------------------------
(modifiers) @keyword

; -----------------------------------------------------------
; Keywords — declaration/control-flow keywords (as tokens)
; -----------------------------------------------------------
[
  "package"
  "import"
  "class"
  "struct"
  "enum"
  "interface"
  "func"
  "main"
  "let"
  "var"
  "const"
  "init"
  "prop"
  "operator"
  "macro"
  "quote"
  "extend"
  "type"
  "foreign"
  "inout"
  "where"
  "mut"
  "unsafe"
  "spawn"
  "synchronized"
  "open"
  "override"
  "redef"
  "sealed"
  "abstract"
  "get"
  "set"
] @keyword

; -----------------------------------------------------------
; Keywords — control flow
; -----------------------------------------------------------
[
  "if"
  "else"
  "for"
  "in"
  "do"
  "while"
  "match"
  "case"
  "try"
  "catch"
  "finally"
  "throw"
  "return"
  "break"
  "continue"
  "is"
  "as"
  "super"
  "this"
] @keyword

; -----------------------------------------------------------
; Boolean keywords
; -----------------------------------------------------------
[
  "true"
  "false"
] @boolean

; -----------------------------------------------------------
; Operators
; -----------------------------------------------------------
[
  "."
  ","
  "("
  ")"
  "["
  "]"
  "{"
  "}"
  "**"
  "*"
  "%"
  "/"
  "+"
  "-"
  "++"
  "--"
  "&&"
  "||"
  "!"
  "&"
  "|"
  "^"
  "~"
  "<<"
  ">>"
  ":"
  ";"
  "="
  "+="
  "-="
  "*="
  "**="
  "/="
  "%="
  "&="
  "|="
  "^="
  "<<="
  ">>="
  "&&="
  "||="
  "->"
  "<-"
  "=>"
  ".."
  "..="
  "..."
  "@"
  "?"
  "<:"
  "<"
  ">"
  "<="
  ">="
  "!="
  "=="
  "|>"
  "~>"
  "??"
] @operator

; -----------------------------------------------------------
; Punctuation delimiters
; -----------------------------------------------------------
[
  ";"
  ","
  "."
] @punctuation.delimiter

; -----------------------------------------------------------
; Brackets
; -----------------------------------------------------------
[
  "("
  ")"
  "{"
  "}"
  "["
  "]"
] @punctuation.bracket
