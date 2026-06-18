; Cangjie syntax highlighting for Zed

; ============================================
; Comments
; ============================================
(lineComment) @comment
(blockComment) @comment

; ============================================
; Literals
; ============================================
(stringLiteral) @string
(integerLiteral) @number
(floatLiteral) @number.float
(runeLiteral) @string.special
(booleanLiteral) @boolean
(unitLiteral) @constant.builtin
(wildcardPattern) @constant.builtin

; ============================================
; Variables & Parameters
; ============================================
(varBindingPattern) @variable
(parameter
  paraName: (identifier) @variable.parameter)
(thisSuperExpression) @variable.builtin

; ============================================
; Functions
; ============================================
(funcName) @function
(callSuffix) @function.call

; ============================================
; Types (user-defined)
; ============================================
(className) @type
(structName) @type
(enumName) @type
(interfaceName) @type
(typeAliasName) @type
(propertyName) @property
(returnType
  (_) @type)

; ============================================
; Modifiers → @keyword
; ============================================
(modifiers) @keyword

; ============================================
; Keyword tokens (anonymous)
; ============================================
[
  "package" "import" "as"
  "class" "struct" "enum" "interface"
  "func" "main"
  "let" "var" "const"
  "init" "prop"
  "operator" "macro" "quote" "extend"
  "type" "foreign" "inout" "where"
  "mut" "unsafe" "spawn" "synchronized"
  "open" "override" "redef" "sealed" "abstract"
  "public" "private" "protected" "static" "internal"
  "get" "set"
] @keyword

; ============================================
; Control flow keywords
; ============================================
[
  "if" "else"
  "for" "in" "do" "while"
  "match" "case"
  "try" "catch" "finally" "throw"
  "return" "break" "continue"
  "is" "as"
  "super" "this"
] @keyword

; ============================================
; Boolean literals
; ============================================
["true" "false"] @boolean

; ============================================
; Built-in types (named nodes from grammar aliases)
; ============================================
[
  (String)
  (Int8) (Int16) (Int32) (Int64) (IntNative)
  (UInt8) (UInt16) (UInt32) (UInt64) (UIntNative)
  (Float16) (Float32) (Float64)
  (Rune) (Bool) (Nothing) (Unit) (Thistype)
] @type.builtin

; ============================================
; Operators
; ============================================
[
  "+" "-" "*" "/" "%" "**"
  "++" "--"
  "==" "!=" "<" ">" "<=" ">="
  "!" "~"
  "&&" "||"
  "&" "|" "^" "<<" ">>"
  "=" "+=" "-=" "*=" "/=" "%="
  "**=" "&=" "|=" "^=" "<<=" ">>="
  "&&=" "||="
  "?" "??" "|>" "~>"
  ".." "..=" "..."
  "->" "<-" "=>" "<:"
  "@"
] @operator

; ============================================
; Punctuation
; ============================================
[ ";" "," "." ] @punctuation.delimiter
[ "(" ")" "{" "}" "[" "]" ] @punctuation.bracket

; ============================================
; String interpolation
; ============================================
(inlineExpression) @embedded
(inMultiLineStringExpression) @embedded
