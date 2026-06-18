; Cangjie text objects for Vim mode in Zed

; Function text objects
(functionDefinition
  body: (_
    "{" @function.inside
    "}" @function.inside
  ) @function.around)

; Operator function text objects
(operatorFunctionDefinition
  body: (_
    "{" @function.inside
    "}" @function.inside
  ) @function.around)

; Class text objects
(classDefinition
  body: (_
    "{" @class.inside
    "}" @class.inside
  ) @class.around)

; Struct text objects
(structDefinition
  body: (_
    "{" @class.inside
    "}" @class.inside
  ) @class.around)

; Interface text objects
(interfaceDefinition
  body: (_
    "{" @class.inside
    "}" @class.inside
  ) @class.around)

; Enum text objects
(enumDefinition
  body: (_
    "{" @class.inside
    "}" @class.inside
  ) @class.around)

; Comment text objects
(lineComment) @comment.around
(blockComment) @comment.around
