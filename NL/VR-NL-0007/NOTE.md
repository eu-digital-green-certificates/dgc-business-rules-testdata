The rule as it is now works with `certlogic-js` version 1.2.0, and `certlogic-kotlin` version 0.11.0.
It checks explicitly for the DOB being truthy.
The only falsy value for the DOB allowed by the JSON Schema is the empty string `"""`.

After upgrading to 1.2.1 and 0.11.1 respectively, the following would also work to check whether someone is a minor:

```json
{
  "and": [
    {
      "var": "payload.dob"
    },
    {
      "after": [
        {
          "dccDateOfBirth": [
            {
              "var": "payload.dob"
            }
          ]
        },
        {
          "plusTime": [
            {
              "var": "external.validationClock"
            },
            -18,
            "year"
          ]
        }
      ]
    }
  ]
}
```

In other words: change `if` &rarr; `and`, and remove the third operand `false`.
After that change, this expression returns `true` for a minor, and the falsy value `""` for a non-minor - not `false`!
(These patch versions fix a problem with the `and` operation not evaluating its operands lazily - i.e., not “shortcutting”.)

