'use strict';

function replaceAll(s:string, substr:string, newSubstr:string) : string
{
    while( s.indexOf(substr) !== -1 )
    {
        s = s.replace(substr, newSubstr);
    }

    return s;
}

function *reversed<T>(a: T[])
{
    for(let i=a.length-1; i>=0 ; i--)
    {
        yield a[i];
    }
}

export class Expander
{
    private definitions = new Map<string, string>();
    private topologicalOrder: string[] = [];

    constructor(M : Map<string, string>)
    {
        for( let [k, v] of M)
        {
            this.definitions.set(`\${${k}}`, v);
        }

        const visiting = new Set<string>();
        const visited = new Set<string>();

        const visit = (s: string) =>
        {
            if( visiting.has(s) )
            {
                throw Error("cyclic variable definition");
            }

            if( visited.has(s) )
            {
                return;
            }

            visiting.add(s);
            visited.add(s);

            const val = this.definitions.get(s);

            for( let k of this.definitions.keys() )
            {
                if( val.indexOf(k) !== -1 )
                {
                    visit(k);
                }
            }

            visiting.delete(s);
            this.topologicalOrder.push(s);
        };

        for( let k of this.definitions.keys() )
        {
            visit(k);
        }
    }

    private expandString(s: string) : string
    {
        for( let v of reversed(this.topologicalOrder) )
        {
            s = replaceAll(s, v, this.definitions.get(v) );
        }
        
        return s;
    }

    private expandArray(a: string[]) : string[]
    {
        return a.map( s => this.expandString(s) );
    }

    private expandMap(a: Map<string, string>) : Map<string, string>
    {
        let M = new Map<string, string>();

        for( let [v, val] of a )
        {
            M.set(v, this.expandString(val));
        }
        
        return M;
    }

    public expand(s: string) : string;
    public expand(a: string[]) : string[];
    public expand(n: null) : null;
    public expand(u: undefined) : undefined;
    public expand(x: Map<string,string>)
    public expand(x: any)
    {
        if( x === null )
        {
            return null;
        }
        else if ( x === undefined )
        {
            return undefined;
        }
        else if( typeof x === 'string' )
        {
            return this.expandString(x);
        }
        else if( x instanceof Array )
        {
            return this.expandArray(x);
        }
        else
        {
            return this.expandMap(x);
        }
    }
}
