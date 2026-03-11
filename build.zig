const std = @import("std");

pub fn build(b: *std.Build) void {
    // Standard target options allow the person running `zig build` to choose
    // what target to build for. Here we do not override the defaults, which
    // means any target is allowed, and the default is native. Other options
    // for restricting supported target set are available.
    const target = b.resolveTargetQuery(.{
        .cpu_arch = .wasm32,
        .os_tag = .freestanding,
    });

    // Standard optimization options allow the person running `zig build` to select
    // between Debug, ReleaseSafe, ReleaseFast, and ReleaseSmall. Here we tie
    // them together.
    const optimize = b.standardOptimizeOption(.{});

    const exe = b.addExecutable(.{
        .name = "zigcel",
        // In this case the main source file is merely a path, however, in more
        // complicated build scripts, this could be a generated file.
        .root_source_file = b.path("src/main.zig"),
        .target = target,
        .optimize = optimize,
    });

    // WASM specific settings for freestanding
    exe.entry = .disabled; // We are building a library essentially
    exe.rdynamic = true; // Export symbols

    // This declares intent for the executable to be installed into the
    // standard location when the user invokes the "install" step (the default
    // step when running `zig build`).
    b.installArtifact(exe);

    // Creates a step for unit testing.
    // For tests, we use the *native* target instead of wasm32-freestanding,
    // so that the standard library can use OS features like stdout to print test results.
    const native_target = b.resolveTargetQuery(.{});
    const main_tests = b.addTest(.{
        .root_source_file = b.path("src/main.zig"),
        .target = native_target, // Changed from target (wasm32) to native_target
        .optimize = optimize,
    });

    const run_main_tests = b.addRunArtifact(main_tests);

    // This creates a build step. It will be visible in the `zig build --help` menu,
    // and can be selected like this: `zig build test`
    const test_step = b.step("test", "Run library tests");
    test_step.dependOn(&run_main_tests.step);
}
