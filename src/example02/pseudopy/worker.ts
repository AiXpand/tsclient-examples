export const workerCode = `
_result=None
skip = False
for _ in range(plugin.cfg_max_tries):
  # generate up to \`max_tries\` numbers in this call
  num = plugin.np.random.randint(1, 10_000)
  for n in range(2,int(num**0.5)+1):
    if num % n == 0:
      # the generated number is not a prime
      skip=True
      break
    # endif
  # endfor
  if not skip:
    _result=num
    break
  # endif
# endfor
`;
