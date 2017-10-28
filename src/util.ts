'use strict';

import * as fs from 'fs';
import * as stream from 'stream';
import * as child_process from 'child_process';

import * as vscode from 'vscode';

import * as ajv from 'ajv';

function readFile(fileName: string) : Promise<string>
{
    return new Promise<string>( (resolve, reject) =>
    {
        fs.readFile(fileName, "utf-8", (err, data) =>
        {
            if(err)
            {
                reject(err);
            }
            else
            {
                resolve(data);
            }
        });
    });
}

export async function readJSON(fileName: string, validate?:ajv.ValidateFunction) : Promise<any>
{
    let data = await readFile(fileName);
    let json = JSON.parse(data);

    if( validate && ! await validate(json) )
    {
        throw Error(`${fileName} has invalid format: ` + validate.errors);
    }

    return json;
}

export async function readSchema(fileName: string) : Promise<any>
{
    let schema = await readJSON(fileName);
    return (new ajv()).compile(schema);
}

export function splitLines(s: stream.Readable) : void
{
    let buf: string = '';

    s.setEncoding('utf8');
    
    function emit(line: string)
    {
        s.emit('line', line);
    }

    function emitAll()
    {
        let lines = buf.split('\n');

        if( buf.length > 0 && ! buf.endsWith('\n') )
        {
            buf = lines.pop();
        }
        else
        {
            buf = '';
        }

        for( let l of lines)
        {
            emit(l);
        }
    }

    s.on('data', (chunk:string) => 
    {
        buf += chunk;
        emitAll();
    });

    s.on('end', () => 
    {
        if( buf.length > 0)
        {
            emit(buf);
        }
    });
}

export function translateTermination(proc:child_process.ChildProcess)
{
    proc.on('error', (e) => 
    {
        proc.emit('terminated', `failed: ${e.message}`);
        proc.emit('fail', `failed: ${e.message}.`);
    });

    proc.on('exit', (code, signal)  => 
    {
        var message;
        var event;

        if( signal )
        {
            message =`killed with signal ${signal}.`;
            event = 'fail';
        }
        else if( code !== 0 )
        {
            message = `exited with return code: ${code}.`;
            event = 'fail';
        }
        else
        {
            message = `exited normally.`;
            event = 'success';
        }

        proc.emit('terminated', message);
        proc.emit(event, message);    
    });
}

export function displayOutput(c: vscode.OutputChannel, s:stream.Readable): void
{
    s.setEncoding('utf8');

    s.on('data', (chunk:string) => 
    {
        c.append(chunk);
    });
}

export function spawn(program:string, args:string[], cwd:string, env?:Map<string, string>) : child_process.ChildProcess
{
    let options = {};

    if( cwd )
    {
        options['cwd'] = cwd;
    }

    if( env )
    {
        let e = {...process.env};

        for( let [v, val] of env )
        {
            e[v] = val;
        }

        options["env"] = e;
    }

    let proc = child_process.spawn(program, args, options);

    translateTermination(proc);

    return proc;
}

export function redirectToChannel(proc: child_process.ChildProcess, channel: vscode.OutputChannel, init: boolean = false)
{
    if( init )
    {
        channel.clear();
        channel.show();
    }

    displayOutput(channel, proc.stdout);
    displayOutput(channel, proc.stderr);
}

export function merge<T>(...ts:T[]) : T
{
    return <T>Object.assign({}, ...ts);
}

export function *entries(o: object) : IterableIterator<[string, string]>
{
    for(let k of Object.keys(o) )
    {
        yield [k, <string>o[k]];
    }
}

export function to_object(M: Map<string, string>)
{
    const o = new Object();

    for( let [k, v] of M )
    {
        o[k] = v;
    }

    return o;
}
