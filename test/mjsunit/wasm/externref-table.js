// Copyright 2019 the V8 project authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

// Flags: --experimental-wasm-reftypes

d8.file.execute("test/mjsunit/wasm/wasm-module-builder.js");

(function TestExternRefTableSetWithMultipleTypes() {
  print(arguments.callee.name);
  let table = new WebAssembly.Table({element: "externref", initial: 10});

  // Table should be initialized with undefined.
  assertEquals(undefined, table.get(1));
  let obj = {'hello' : 'world'};
  table.set(2, obj);
  assertSame(obj, table.get(2));
  table.set(3, 1234);
  assertEquals(1234, table.get(3));
  table.set(4, 123.5);
  assertEquals(123.5, table.get(4));
  table.set(5, undefined);
  assertEquals(undefined, table.get(5));
  // Overwrite entry 4, because null would otherwise be the default value.
  table.set(4, null);
  assertEquals(null, table.get(4));
  table.set(7, print);
  assertEquals(print, table.get(7));

  assertThrows(() => table.set(12), RangeError);
})();

(function TestImportExternRefTable() {
  print(arguments.callee.name);

  const builder = new WasmModuleBuilder();
  const table_index = builder.addImportedTable("imp", "table", 3, 10, kWasmExternRef);
  builder.addFunction('get', kSig_r_v)
  .addBody([kExprI32Const, 0, kExprTableGet, table_index]);

  let table_ref = new WebAssembly.Table({element: "externref", initial: 3, maximum: 10});
  builder.instantiate({imp:{table: table_ref}});

  let table_func = new WebAssembly.Table({ element: "anyfunc", initial: 3, maximum: 10 });
  assertThrows(() => builder.instantiate({ imp: { table: table_func } }),
    WebAssembly.LinkError, /imported table does not match the expected type/);
})();

(function TestExternRefDropDeclarativeElementSegment() {
  print(arguments.callee.name);

  const builder = new WasmModuleBuilder();
  builder.addDeclarativeElementSegment([WasmInitExpr.RefNull(kWasmFuncRef)],
                                        kWasmFuncRef);
  builder.addFunction('drop', kSig_v_v)
      .addBody([kNumericPrefix, kExprElemDrop, 0])
      .exportFunc();
  const instance = builder.instantiate();

  // Counts as double-drop because declarative segments are dropped on
  // initialization and is therefore not expected to throw.
  instance.exports.drop();
})();

(function TestExternRefTableInitFromDeclarativeElementSegment() {
  print(arguments.callee.name);

  const builder = new WasmModuleBuilder();
  const table = builder.addTable(kWasmAnyFunc, 10);
  builder.addDeclarativeElementSegment([WasmInitExpr.RefNull(kWasmFuncRef)],
                                       kWasmFuncRef);
  builder.addFunction('init', kSig_v_v)
      .addBody([
        kExprI32Const, 0, kExprI32Const, 0, kExprI32Const, 1, kNumericPrefix,
        kExprTableInit, table.index, 0
      ])
      .exportFunc();
  const instance = builder.instantiate();

  assertTraps(kTrapTableOutOfBounds, () => instance.exports.init());
})();


(function TestExternRefTableConstructorWithDefaultValue() {
  print(arguments.callee.name);
  const testObject = {};
  const argument = { "element": "externref", "initial": 3 };
  const table = new WebAssembly.Table(argument, testObject);
  assertEquals(table.length, 3);
  assertEquals(table.get(0), testObject);
  assertEquals(table.get(1), testObject);
  assertEquals(table.get(2), testObject);
})();

function getDummy(val) {
  let builder = new WasmModuleBuilder();
  builder.addFunction('dummy', kSig_i_v)
      .addBody([kExprI32Const, val])
      .exportAs('dummy');
  return builder.instantiate().exports.dummy;
}

(function TestFuncRefTableConstructorWithDefaultValue() {
  print(arguments.callee.name);

  const expected = 6;
  let dummy = getDummy(expected);

  const argument = { "element": "anyfunc", "initial": 3 };
  const table = new WebAssembly.Table(argument, dummy);
  assertEquals(table.length, 3);
  assertEquals(table.get(0)(), expected);
  assertEquals(table.get(1)(), expected);
  assertEquals(table.get(2)(), expected);
})();

(function TestExternFuncTableSetWithoutValue() {
  print(arguments.callee.name);

  const expected = 6;
  const dummy = getDummy(expected);
  const argument = { "element": "anyfunc", "initial": 3 };
  const table = new WebAssembly.Table(argument, dummy);
  assertEquals(table.get(1)(), expected);
  table.set(1);
  assertEquals(table.get(1), null);
})();

(function TestExternRefTableSetWithoutValue() {
  print(arguments.callee.name);

  const testObject = {};
  const argument = { "element": "externref", "initial": 3 };
  const table = new WebAssembly.Table(argument, testObject);
  assertEquals(table.get(1), testObject);
  table.set(1);
  assertEquals(table.get(1), undefined);
})();
