const std = @import("std");

// Export a simple add function to test WASM call from JS
export fn add(a: i32, b: i32) i32 {
    return a + b;
}
