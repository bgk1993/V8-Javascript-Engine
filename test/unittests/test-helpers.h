// Copyright 2016 the V8 project authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

#ifndef V8_UNITTESTS_TEST_HELPERS_H_
#define V8_UNITTESTS_TEST_HELPERS_H_

#include <memory>

#include "include/v8-primitive.h"
#include "src/parsing/parse-info.h"

namespace v8 {

class Isolate;

namespace internal {

class Object;
template <typename T>
class Handle;
class Isolate;

namespace test {

class ScriptResource : public v8::String::ExternalOneByteStringResource {
 public:
  ScriptResource(const char* data, size_t length)
      : data_(data), length_(length) {}
  ~ScriptResource() override = default;
  ScriptResource(const ScriptResource&) = delete;
  ScriptResource& operator=(const ScriptResource&) = delete;

  const char* data() const override { return data_; }
  size_t length() const override { return length_; }

 private:
  const char* data_;
  size_t length_;
};

Handle<String> CreateSource(
    Isolate* isolate,
    v8::String::ExternalOneByteStringResource* maybe_resource);
Handle<SharedFunctionInfo> CreateSharedFunctionInfo(
    Isolate* isolate,
    v8::String::ExternalOneByteStringResource* maybe_resource);
std::unique_ptr<ParseInfo> OuterParseInfoForShared(
    Isolate* isolate, Handle<SharedFunctionInfo> shared,
    UnoptimizedCompileState* state);

}  // namespace test
}  // namespace internal
}  // namespace v8

#endif  // V8_UNITTESTS_TEST_HELPERS_H_
