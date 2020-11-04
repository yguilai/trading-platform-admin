<template>
  <div class="app-container">
    <el-form
      ref="form"
      :model="formModel"
      label-width="150px"
      style="width: 500px"
      :rules="rules"
    >
      <el-form-item label="旧密码" prop="oldPwd">
        <el-input v-model="formModel.oldPwd" type="password" show-password auto-complete="off" />
      </el-form-item>
      <el-form-item label="新密码" prop="newPwd">
        <el-input v-model="formModel.newPwd" type="password" show-password auto-complete="off" />
      </el-form-item>
      <el-form-item label="重复新密码" prop="reNewPwd">
        <el-input v-model="formModel.reNewPwd" type="password" show-password auto-complete="off" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="submit">提交</el-button>
        <el-button type="primary" @click="$refs.form.resetFields()">重置</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
import { updatePwd } from '@/api/sysUser'

export default {
  name: 'UpdatePwd',
  data() {
    const validateRePass = (rule, value, callback) => {
      if (value !== this.formModel.newPwd) {
        callback(new Error('两次输入密码不一致!'))
      } else {
        callback()
      }
    }
    return {
      formModel: {
        oldPwd: '',
        newPwd: '',
        reNewPwd: ''
      },
      rules: {
        oldPwd: [
          { required: true, message: '请输入旧密码', trigger: 'blur' },
          { min: 6, max: 16, message: '长度在 6 到 16 个字符', trigger: 'blur' }
        ],
        newPwd: [
          { required: true, message: '请输入新密码', trigger: 'blur' },
          { min: 6, max: 16, message: '长度在 6 到 16 个字符', trigger: 'blur' }
        ],
        reNewPwd: [
          { required: true, message: '请重复新密码', trigger: 'blur' },
          { min: 6, max: 16, message: '长度在 6 到 16 个字符', trigger: 'blur' },
          { validator: validateRePass, message: '两次密码不一致', trigger: 'blur' }
        ]
      }
    }
  },
  methods: {
    submit() {
      this.$refs.form.validate(async valid => {
        if (valid) {
          try {
            await updatePwd({
              username: this.$store.getters['name'],
              newPwd: this.formModel.newPwd,
              oldPwd: this.formModel.oldPwd
            })
            this.$message({
              type: 'success',
              message: '修改成功',
              duration: 1000,
              onClose: () => {
                this.$store.dispatch('user/logout')
                this.$router.push('/login')
              }
            })
          } catch (e) {
            this.$message.error(e.message)
          }
        } else {
          return false
        }
      })
    }
  }
}
</script>

<style scoped>

</style>
