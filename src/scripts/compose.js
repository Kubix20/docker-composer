var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var child_process_1 = __importDefault(require("child_process"));
/**
 * Converts supplied yml files to cli arguments
 * https://docs.docker.com/compose/reference/overview/#use--f-to-specify-name-and-path-of-one-or-more-compose-files
 */
var configToArgs = function (config) {
    if (typeof config === 'undefined') {
        return [];
    }
    else if (typeof config === 'string') {
        return ['-f', config];
    }
    else if (config instanceof Array) {
        return config.reduce(function (args, item) { return args.concat(['-f', item]); }, []);
    }
    throw new Error("Invalid argument supplied: " + config);
};
/**
 * Converts docker-compose commandline options to cli arguments
 */
var composeOptionsToArgs = function (composeOptions) {
    var composeArgs = [];
    composeOptions.forEach(function (option) {
        if (option instanceof Array) {
            composeArgs = composeArgs.concat(option);
        }
        if (typeof option === 'string') {
            composeArgs = composeArgs.concat([option]);
        }
    });
    return composeArgs;
};
/**
 * Executes docker-compose command with common options
 */
var execCompose = function (command, args, options, handlers = []) {
    if (options === void 0) { options = {}; }
    console.log("Executing "+command);
   
    var composeOptions = options.composeOptions || [];
    var commandOptions = options.commandOptions || [];
    var composeArgs = composeOptionsToArgs(composeOptions);
    composeArgs = composeArgs.concat(configToArgs(options.config).concat([command].concat(composeOptionsToArgs(commandOptions), args)));
    var cwd = options.cwd;
    var env = options.env || undefined;
    var childProc = child_process_1.default.spawn('docker-compose', composeArgs, { cwd: cwd, env: env }, { shell: '/bin/bash' });
    childProc.on('error', function (err) {
        if(handlers.onError)
            handlers.onError(childProc.pid, err);
    });

    if(options.stdinArgs){
        for(let i = 0; i < options.stdinArgs.length; i++)
            childProc.stdin.write(options.stdinArgs[i]+'\n');
    }

    childProc.stdout.on('data', function (chunk) {
        if(handlers.onStdout)
            handlers.onStdout(childProc.pid, chunk.toString());
    });
    childProc.stderr.on('data', function (chunk) {
        if(handlers.onStderr)
            handlers.onStderr(childProc.pid, chunk.toString());
    });
    childProc.on('exit', function (exitCode) {
        // console.log(exitCode);
        if(handlers.onExit)
            handlers.onExit(childProc.pid);
    });
    if (options.log) {
        childProc.stdout.pipe(process.stdout);
        childProc.stderr.pipe(process.stderr);
    }

    return childProc;
};
/**
 * Determines whether or not to use the default non-interactive flag -d for up commands
 */
var shouldUseDefaultNonInteractiveFlag = function (options) {
    if (options === void 0) { options = {}; }
    var commandOptions = options.commandOptions || [];
    var containsOtherNonInteractiveFlag = commandOptions.reduce(function (memo, item) {
        return memo && !item.includes('--abort-on-container-exit');
    }, true);
    return containsOtherNonInteractiveFlag;
};
exports.upAll = function (options, handlers) {
    // var args = shouldUseDefaultNonInteractiveFlag(options) ? ['-d'] : [];
    return execCompose('up', ['--no-color'], options, handlers);
};
exports.upMany = function (services, options, handlers) {
    var args = shouldUseDefaultNonInteractiveFlag(options) ? ['-d'].concat(services) : services;
    return execCompose('up', args, options);
};
exports.upOne = function (service, options, handlers) {
    var args = shouldUseDefaultNonInteractiveFlag(options) ? ['-d', service] : [service];
    return execCompose('up', args, options);
};
exports.down = function (options, handlers) {
    return execCompose('down', [], options, handlers);
};
exports.stop = function (options, handlers) {
    return execCompose('stop', [], options, handlers);
};
exports.stopOne = function (service, options, handlers) {
    return execCompose('stop', [service], options);
};
exports.kill = function (options, handlers) {
    return execCompose('kill', [], options);
};
exports.rm = function (options, handlers) {
    return execCompose('rm', ['-f'], options);
};
exports.exec = function (container, command, options, handlers) {
    var args = Array.isArray(command) ? command : command.split(/\s+/);
    return execCompose('exec', ['-T', container].concat(args), options);
};
exports.run = function (container, command, options, handlers) {
    var args = Array.isArray(command) ? command : command.split(/\s+/);
    return execCompose('run', ['-T', container].concat(args), options);
};
exports.buildAll = function (options, handlers) {
    if (options === void 0) { options = {}; }
    return execCompose('build', options.parallel ? ['--parallel'] : [], options);
};
exports.buildMany = function (services, options, handlers) {
    if (options === void 0) { options = {}; }
    return execCompose('build', options.parallel ? ['--parallel'].concat(services) : services, options);
};
exports.buildOne = function (service, options, handlers) {
    return execCompose('build', [service], options, handlers);
};
exports.pullAll = function (options, handlers) {
    if (options === void 0) { options = {}; }
    return execCompose('pull', [], options, handlers);
};
exports.pullMany = function (services, options, handlers) {
    if (options === void 0) { options = {}; }
    return execCompose('pull', services, options, handlers);
};
exports.pullOne = function (service, options, handlers) {
    return execCompose('pull', [service], options, handlers);
};
exports.config = function (options, handlers) {
    return execCompose('config', [], options, handlers);
};
exports.configServices = function (options, handlers) {
    return execCompose('config', ['--services'], options, handlers);
};
exports.configVolumes = function (options, handlers) {
    return execCompose('config', ['--volumes'], options, handlers);
};
exports.ps = function (options, handlers) {
    return execCompose('ps', [], options, handlers);
};
exports.push = function (options, handlers) {
    if (options === void 0) { options = {}; }
    return execCompose('push', options.ignorePushFailures ? ['--ignore-push-failures'] : [], options, handlers);
};
exports.restartAll = function (options, handlers) {
    return execCompose('restart', [], options, handlers);
};
exports.restartMany = function (services, options, handlers) {
    return execCompose('restart', services, options, handlers);
};
exports.restartOne = function (service, options, handlers) {
    return exports.restartMany([service], options, handlers);
};
exports.logs = function (services, options, handlers) {
    if (options === void 0) { options = {}; }
    var args = Array.isArray(services) ? services : [services];
    if (options.follow) {
        args = ['--follow'].concat(args);
    }
    return execCompose('logs', args, options, handlers);
};
exports.port = function (service, containerPort, options, handlers) {
    var args = [service, containerPort];
    return execCompose('port', args, options, handlers);
};
exports.version = function (options, handlers) {
    return execCompose('version', ['--short'], options, handlers);
};
