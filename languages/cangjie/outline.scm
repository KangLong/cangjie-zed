; Cangjie outline rules for Zed

; Package declaration
(packageDeclaration
  packageName: (_) @name) @item

; Functions
(functionDefinition
  (funcName) @name) @item

; Operator functions
(operatorFunctionDefinition
  operator: (_) @name) @item

; Class definitions
(classDefinition
  (className) @name) @item

; Struct definitions
(structDefinition
  (structName) @name) @item

; Enum definitions
(enumDefinition
  (enumName) @name) @item

; Interface definitions
(interfaceDefinition
  (interfaceName) @name) @item

; Properties
(propertyDefinition
  (propertyName) @name) @item

; Type aliases
(typeAlias
  (typeAliasName) @name) @item

; Init constructor
(init) @item

; Variable declarations at top level
(variableDeclaration) @item
