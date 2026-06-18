; Cangjie indentation rules for Zed

; Indent: increase indent inside blocks and bodies
(classBody) @indent
(structBody) @indent
(enumBody) @indent
(interfaceBody) @indent
(extendBody) @indent
(foreignBody) @indent

(block) @indent

; Function/method/init bodies
(functionDefinition
  (block) @indent)
(operatorFunctionDefinition
  (block) @indent)
(init
  (block) @indent)

; Control flow bodies
(ifExpression
  consequence: (block) @indent)
(ifExpression
  alternative: (_) @indent)
(forInExpression
  (block) @indent)
(whileExpression
  (block) @indent)
(doWhileExpression
  (block) @indent)
(tryExpression
  (block) @indent)

; Match cases
(matchCase) @indent

; Array literals
(arrayLiteral) @indent

; Lambda bodies
(lambdaExpression
  (block) @indent)

; Dedent: closing tokens
("]" @indent.end)
(")" @indent.end)
("}" @indent.end)
